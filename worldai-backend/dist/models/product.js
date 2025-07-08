import { DataTypes, Model } from 'sequelize';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
export default function initProductModel(sequelize) {
    class Product extends Model {
        static async validateProduct(productData) {
            const productInstance = plainToClass(Product, productData);
            const errors = await validate(productInstance);
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
            }
        }
        getProductDetails() {
            return {
                id: this.id,
                stripeId: this.stripeId,
                priceId: this.priceId,
                name: this.name,
                description: this.description,
                unitAmount: this.unitAmount * 100,
                unitAmountDecimal: this.unitAmount,
                currency: this.currency,
                features: this.features,
                featured: this.featured,
                active: this.active,
                recurring: this.recurring,
                interval: this.interval,
                images: this.images,
                metadata: this.metadata,
                createdAt: this.createdAt,
                updatedAt: this.updatedAt
            };
        }
    }
    Product.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        stripeId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: 'Stripe product ID cannot be empty'
                }
            }
        },
        priceId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Stripe price ID cannot be empty'
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Product name cannot be empty'
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        unitAmount: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                isFloat: {
                    msg: 'Unit amount must be a number'
                },
                min: {
                    args: [0],
                    msg: 'Unit amount cannot be negative'
                }
            }
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'usd',
            validate: {
                notEmpty: {
                    msg: 'Currency cannot be empty'
                }
            }
        },
        features: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: [],
        },
        featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        recurring: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        interval: {
            type: DataTypes.ENUM('day', 'week', 'month', 'year'),
            allowNull: true,
        },
        images: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: [],
        },
        credits: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        },
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        hooks: {
            beforeValidate: async (model) => {
                await Product.validateProduct(model);
            }
        },
    });
    return Product;
}
