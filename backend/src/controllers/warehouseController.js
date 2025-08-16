const db = require('../config/database');

const warehouseController = {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const offset = (page - 1) * limit;

            let query = db('warehouses')
                .select('*')
                .limit(limit)
                .offset(offset)
                .orderBy('created_at', 'desc');

            if (search) {
                query = query.where(function() {
                    this.where('name', 'ilike', `%${search}%`)
                        .orWhere('location', 'ilike', `%${search}%`)
                        .orWhere('code', 'ilike', `%${search}%`);
                });
            }

            const warehouses = await query;
            const total = await db('warehouses').count('id as count').first();

            res.json({
                success: true,
                data: {
                    warehouses,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total.count / limit),
                        total_items: parseInt(total.count),
                        items_per_page: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get warehouses error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get warehouses',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    async getById(req, res) {
        try {
            const warehouse = await db('warehouses').where('id', req.params.id).first();

            if (!warehouse) {
                return res.status(404).json({
                    success: false,
                    message: 'Warehouse not found'
                });
            }

            res.json({
                success: true,
                data: { warehouse }
            });
        } catch (error) {
            console.error('Get warehouse error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get warehouse',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    async create(req, res) {
        try {
            const [warehouse] = await db('warehouses')
                .insert({
                    ...req.body,
                    created_by: req.user.userId
                })
                .returning('*');

            // Log warehouse creation
            await db('system_logs').insert({
                level: 'info',
                action: 'warehouse_created',
                message: `Warehouse created: ${warehouse.name}`,
                user_id: req.user.userId,
                module: 'warehouses',
                entity_type: 'warehouses',
                entity_id: warehouse.id
            });

            res.status(201).json({
                success: true,
                message: 'Warehouse created successfully',
                data: { warehouse }
            });
        } catch (error) {
            console.error('Create warehouse error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create warehouse',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    async update(req, res) {
        try {
            const [warehouse] = await db('warehouses')
                .where('id', req.params.id)
                .update({
                    ...req.body,
                    updated_at: db.fn.now()
                })
                .returning('*');

            if (!warehouse) {
                return res.status(404).json({
                    success: false,
                    message: 'Warehouse not found'
                });
            }

            res.json({
                success: true,
                message: 'Warehouse updated successfully',
                data: { warehouse }
            });
        } catch (error) {
            console.error('Update warehouse error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update warehouse',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await db('warehouses').where('id', req.params.id).del();

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Warehouse not found'
                });
            }

            res.json({
                success: true,
                message: 'Warehouse deleted successfully'
            });
        } catch (error) {
            console.error('Delete warehouse error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete warehouse',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
};

module.exports = warehouseController;