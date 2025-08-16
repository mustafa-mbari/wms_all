const db = require('../config/database');

class User {
    static async findAll({ page = 1, limit = 10, search = '', sort = 'created_at', order = 'desc' }) {
        const offset = (page - 1) * limit;

        let query = db('users')
            .select('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'address', 'birth_date', 'gender', 'is_active', 'email_verified', 'last_login_at', 'created_at', 'updated_at')
            .limit(limit)
            .offset(offset)
            .orderBy(sort, order);

        if (search) {
            query = query.where(function() {
                this.where('username', 'ilike', `%${search}%`)
                    .orWhere('email', 'ilike', `%${search}%`)
                    .orWhere('first_name', 'ilike', `%${search}%`)
                    .orWhere('last_name', 'ilike', `%${search}%`);
            });
        }

        const users = await query;
        const countQuery = db('users').count('id as count');

        if (search) {
            countQuery.where(function() {
                this.where('username', 'ilike', `%${search}%`)
                    .orWhere('email', 'ilike', `%${search}%`)
                    .orWhere('first_name', 'ilike', `%${search}%`)
                    .orWhere('last_name', 'ilike', `%${search}%`);
            });
        }

        const total = await countQuery.first();

        return {
            users,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total.count / limit),
                total_items: parseInt(total.count),
                items_per_page: limit
            }
        };
    }

    static async findById(id) {
        return await db('users')
            .select('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'address', 'birth_date', 'gender', 'avatar_url', 'is_active', 'email_verified', 'last_login_at', 'created_at', 'updated_at')
            .where('id', id)
            .first();
    }

    static async findByEmail(email) {
        return await db('users')
            .where('email', email)
            .first();
    }

    static async findByUsername(username) {
        return await db('users')
            .where('username', username)
            .first();
    }

    static async create(userData) {
        const [user] = await db('users')
            .insert({
                username: userData.username,
                email: userData.email,
                password_hash: userData.password_hash,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                address: userData.address,
                birth_date: userData.birth_date,
                gender: userData.gender,
                is_active: userData.is_active || true,
                email_verified: userData.email_verified || false
            })
            .returning(['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'address', 'birth_date', 'gender', 'created_at']);

        return user;
    }

    static async update(id, userData) {
        const updateData = { ...userData, updated_at: db.fn.now() };
        delete updateData.id; // Remove id from update data

        const [user] = await db('users')
            .where('id', id)
            .update(updateData)
            .returning(['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'address', 'birth_date', 'gender', 'updated_at']);

        return user;
    }

    static async delete(id) {
        return await db('users')
            .where('id', id)
            .del();
    }

    static async getUserWithRoles(id) {
        return await db('users')
            .select(
                'users.*',
                db.raw('array_agg(DISTINCT roles.slug) as role_slugs'),
                db.raw('array_agg(DISTINCT permissions.slug) as permission_slugs')
            )
            .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
            .leftJoin('roles', 'user_roles.role_id', 'roles.id')
            .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
            .leftJoin('permissions', 'role_permissions.permission_id', 'permissions.id')
            .where('users.id', id)
            .groupBy('users.id')
            .first();
    }
}

module.exports = User;