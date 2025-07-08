import { DataTypes, Model } from 'sequelize';
import { IsString, IsNumber, IsBoolean, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export default function initServicePricingModel(sequelize) {
    class ServicePricing extends Model {
        static async validateServicePricing(pricingData) {
            const pricingInstance = plainToClass(ServicePricing, pricingData);
            const errors = await validate(pricingInstance);
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
            }
        }
    }

    ServicePricing.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [2, 100],
                },
            },
        
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            price: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: 0,
                },
                comment: "Price in credits"
            },
            unit: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "per run",
                validate: {
                    notEmpty: true,
                },
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                validate: {
                    isBoolean: true,
                },
            },
            categoryName: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Category of the service (e.g., 'image', 'video', 'text')"
            },
            serviceIdentifier: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                },
            },
        },
        {
            sequelize,
            modelName: 'ServicePricing',
            tableName: 'service_pricing',
            hooks: {
                beforeValidate: async (pricing) => {
                    await ServicePricing.validateServicePricing(pricing);
                },
            },
            paranoid: true, // Enable soft deletes
        }
    );

    return ServicePricing;
} 