const db = require('../config/database');
const os = require('os');

const systemController = {
    async getSettings(req, res) {
        try {
            const settings = await db('system_settings').select('*');

            res.json({
                success: true,
                data: { settings }
            });
        } catch (error) {
            console.error('Get settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get settings',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    async updateSettings(req, res) {
        try {
            const { key, value } = req.body;

            const [setting] = await db('system_settings')
                .where('key', key)
                .update({ value, updated_at: db.fn.now() })
                .returning('*');

            if (!setting) {
                // Create new setting if doesn't exist
                const [newSetting] = await db('system_settings')
                    .insert({ key, value })
                    .returning('*');

                return res.json({
                    success: true,
                    message: 'Setting created successfully',
                    data: { setting: newSetting }
                });
            }

            res.json({
                success: true,
                message: 'Setting updated successfully',
                data: { setting }
            });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update settings',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    async getLogs(req, res) {
        try {
            const { page = 1, limit = 50, level, module, start_date, end_date } = req.query;
            const offset = (page - 1) * limit;

            let query = db('system_logs')
                .select('*')
                .limit(limit)
                .offset(offset)
                .orderBy('created_at', 'desc');

            if (level) {
                query = query.where('level', level);
            }

            if (module) {
                query = query.where('module', module);
            }

            if (start_date) {
                query = query.where('created_at', '>=', start_date);
            }

            if (end_date) {
                query = query.where('created_at', '<=', end_date);
            }

            const logs = await query;
            const total = await db('system_logs').count('id as count').first();

            res.json({
                success: true,
                data: {
                    logs,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total.count / limit),
                        total_items: parseInt(total.count),
                        items_per_page: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get logs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get logs',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    async getStats(req, res) {
        try {
            const stats = await Promise.all([
                db('users').count('id as count').first(),
                db('products').count('id as count').first(),
                db('warehouses').count('id as count').first(),
                db('roles').count('id as count').first(),
                db('system_logs').where('level', 'error').count('id as count').first()
            ]);

            const systemInfo = {
                platform: os.platform(),
                arch: os.arch(),
                node_version: process.version,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                load_average: os.loadavg()
            };

            res.json({
                success: true,
                data: {
                    counts: {
                        users: parseInt(stats[0].count),
                        products: parseInt(stats[1].count),
                        warehouses: parseInt(stats[2].count),
                        roles: parseInt(stats[3].count),
                        error_logs: parseInt(stats[4].count)
                    },
                    system: systemInfo
                }
            });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get stats',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    async healthCheck(req, res) {
        try {
            // Check database connection
            await db.raw('SELECT 1');

            res.json({
                success: true,
                message: 'System is healthy',
                timestamp: new Date().toISOString(),
                checks: {
                    database: 'healthy',
                    server: 'healthy'
                }
            });
        } catch (error) {
            res.status(503).json({
                success: false,
                message: 'System health check failed',
                checks: {
                    database: 'unhealthy',
                    server: 'healthy'
                },
                error: error.message
            });
        }
    }
};

module.exports = systemController;