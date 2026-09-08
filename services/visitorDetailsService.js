const { User, Role, UserDashboardRoles, UserAccess, Module,ModulesPermissions } = require('../models');
const maxmind = require('maxmind');
const path = require('path');

class VisitorDetailsService {
    get_ip(req) {
        return req.ip;
    }

    get_browser(req) {
        return req.headers['user-agent'];
    }

    async getGeoDetails(ip) {
        const dbFilePath = path.join(__dirname, '../storage/maxmind/GeoLite2-City.mmdb');
        try {
            const lookup = await maxmind.open(dbFilePath);
            const geoDetails = lookup.get(ip);

            // Extract city details
            const cityDetails = geoDetails ? {
                ip: ip,
                city: geoDetails.city ? geoDetails.city.names.en : null,
                country: geoDetails.country ? geoDetails.country.names.en : null,
                location: geoDetails.location ? {
                    latitude: geoDetails.location.latitude,
                    longitude: geoDetails.location.longitude
                } : null
            } : {
                ip: ip,
                city: null,
                country: null,
                location: null
            };

            return JSON.stringify(cityDetails);
        } catch (error) {
            console.error('Error fetching geo details:', error);
            const errorDetails = {
                error: "Error",
                message: error.message
            };
            return JSON.stringify(errorDetails);
        }
    }

    async insertRow(data) {
        const { user_id, role_id, ip, useragent, type } = data;
        const details = await this.getGeoDetails(ip);

        try {
            //console.log('Data to insert:', { user_id, role_id, type, ip, useragent, details });
            const row = await UserAccess.create({
                user_id,
                role_id,
                type,
                ip,
                useragent,
                details
            });
            return row;
        } catch (error) {
            console.error('Error in insertRow:', error.original);
            throw new Error('Failed to log user access');
        }
    }
    async getUserDetails(user_id, role_id) {
        try {
          const user = await User.findByPk(user_id, {
            attributes: { exclude: ['password'] },
            include: [
              {
                model: Role,
                as: 'roles',
                attributes: ['id', 'role_name'],
                through: { attributes: [] },
                include: [
                  {
                    model: Module,
                    as: 'modulesViaPermissions',
                    attributes: ['id', 'title', 'url'],
                    through: { attributes: [] }
                  }
                ]
              }
            ]
          });
      
          if (!user) {
            throw new Error('User not found');
          }
      
          // Find the current role based on role_id
          const currentRole = user.roles.find(role => role.id === parseInt(role_id, 10)); // Ensure type match
      
          if (!currentRole) {
            return { success: false, message: 'Role is not assigned to the user' };
          }
      
          return {
            success: true,
            data: {
              ...user.toJSON(),
              current_role: currentRole.id,
              modules: currentRole.modulesViaPermissions
            }
          };
        } catch (error) {
          console.error('Error fetching user details:', error);
          throw error;
        }
      }
      
      
      
}


module.exports = VisitorDetailsService;