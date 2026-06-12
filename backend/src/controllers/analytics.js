import db, { sequelize } from '../models/index.js';

const { Stock, Warehouse, StorageBin, Asset, Supplier, TransactionLog } = db;

/**
 * Controller Analitik (AnalyticsController)
 * Menyediakan data agregat, statistik kapasitas gudang, dan distribusi stok.
 */
class AnalyticsController {

  /**
   * Mengambil data analitik ringkasan total stok, gudang, aset, dan kapasitas bin
   */
  static async getOverview(req, res, next) {
    try {
      const totalAssetsCount = await Asset.count();
      const totalWarehousesCount = await Warehouse.count();
      const totalBinsCount = await StorageBin.count();
      const filledBinsCount = await StorageBin.count({ where: { status: 'filled' } });
      const emptyBinsCount = totalBinsCount - filledBinsCount;

      const totalStockSum = await Stock.sum('quantity') || 0;
      
      const [[valuationResult]] = await sequelize.query(
        'SELECT COALESCE(SUM(CAST("quantity" AS DECIMAL) * CAST("price" AS DECIMAL)), 0) as total FROM "stocks"'
      );
      const totalValuation = parseFloat(valuationResult?.total) || 0;

      const stockCount = await Stock.count();
      
      const totalInboundLogs = await TransactionLog.count({ where: { type: 'inbound' } });
      const totalOutboundLogs = await TransactionLog.count({ where: { type: 'outbound' } });
      const totalTransactionLogs = totalInboundLogs + totalOutboundLogs;
      
      return res.status(200).json({
        success: true,
        message: 'Ringkasan analitik berhasil dimuat',
        data: {
          totalAssets: totalAssetsCount,
          totalWarehouses: totalWarehousesCount,
          totalBins: totalBinsCount,
          filledBins: filledBinsCount,
          emptyBins: emptyBinsCount,
          totalStock: totalStockSum,
          totalValuation: totalValuation,
          stockRecords: stockCount,
          totalInbound: totalInboundLogs,
          totalOutbound: totalOutboundLogs,
          totalTransactions: totalTransactionLogs
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil sebaran stok barang dikelompokkan per Gudang dan Slot Bin
   */
  static async getStockByWarehouse(req, res, next) {
    try {
      const warehouses = await Warehouse.findAll({
        include: [{
          model: StorageBin,
          as: 'storageBins',
          include: [{
            model: Stock,
            as: 'stock',
            include: [
              { model: Asset, as: 'asset' },
              { model: Supplier, as: 'supplier' }
            ]
          }]
        }],
        order: [['name', 'ASC'], [{ model: StorageBin, as: 'storageBins' }, 'code', 'ASC']]
      });

      const result = warehouses.map(wh => {
        const bins = wh.storageBins || [];
        const filledBins = bins.filter(b => b.status === 'filled');
        
        let totalItems = 0;
        const binDetails = bins.map(b => {
          const qty = b.stock ? Number(b.stock.quantity) : 0;
          totalItems += qty;

          return {
            binId: b.id,
            code: b.code,
            category: b.category,
            status: b.status,
            asset: b.stock?.asset ? {
              id: b.stock.asset.id,
              code: b.stock.asset.code,
              name: b.stock.asset.name,
              category: b.stock.asset.category
            } : null,
            supplier: b.stock?.supplier ? {
              name: b.stock.supplier.name
            } : null,
            quantity: qty,
            price: b.stock ? Number(b.stock.price) : 0,
            updatedAt: b.stock ? b.stock.updatedAt : null
          };
        });

        return {
          warehouseId: wh.id,
          name: wh.name,
          location: wh.location,
          capacity: wh.capacity,
          totalBins: bins.length,
          filledBins: filledBins.length,
          emptyBins: bins.length - filledBins.length,
          totalItems,
          bins: binDetails
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Data sebaran stok per gudang berhasil dimuat',
        data: result,
        debug: {
          warehouseCount: warehouses.length,
          totalBins: warehouses.reduce((sum, wh) => sum + (wh.storageBins?.length || 0), 0),
          totalStocks: warehouses.reduce((sum, wh) => {
            return sum + (wh.storageBins || []).filter(b => b.stock).length;
          }, 0)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil data stok untuk semua aset dengan filter opsional gudang dan slot bin
   */
  static async getAssetStocks(req, res, next) {
    try {
      const { warehouseId, storageBinId } = req.query;
      const whereClause = {};
      const binWhere = {};

      if (storageBinId) {
        whereClause.storageBinId = storageBinId;
      } else if (warehouseId) {
        binWhere.warehouseId = warehouseId;
      }

      const stocks = await Stock.findAll({
        where: whereClause,
        include: [
          {
            model: StorageBin,
            as: 'storageBin',
            where: Object.keys(binWhere).length > 0 ? binWhere : undefined,
            attributes: ['id', 'code', 'warehouseId']
          }
        ]
      });

      const assets = await Asset.findAll({
        attributes: ['id', 'code', 'name'],
        order: [['code', 'ASC']]
      });

      const result = assets.map(asset => {
        const quantity = stocks
          .filter(s => s.assetId === asset.id)
          .reduce((sum, s) => sum + Number(s.quantity), 0);
        return {
          assetId: asset.id,
          code: asset.code,
          name: asset.name,
          quantity
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Data kuantitas stok per aset berhasil dimuat',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AnalyticsController;
