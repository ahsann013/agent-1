import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";
import { validate, } from "class-validator";
import { plainToClass } from "class-transformer";
export default function initUserModel(sequelize) {
    class User extends Model {
        id;
        name;
        email;
        password;
        username;
        isGoogleUser;
        stripeCustomerId;
        sessionId;
        credits;
        type;
        role;
        isTwoFactorEnabled;
        phoneNumber;
        isActive;
        isEmailVerified;
        verificationToken;
        resetPasswordToken;
        isFirstLogin;
        resetPasswordExpires;
        otp;
        otpExpiry;
        ipAddress;
        lastLogin;
        profileImage;
        createdAt;
        updatedAt;
        deletedAt;
        static async hashPassword(user) {
            if (user.changed("password") && user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
        async isValidPassword(password) {
            return bcrypt.compare(password, this.password || '');
        }
        static async validateUser(userData) {
            const userInstance = plainToClass(User, userData);
            const errors = await validate(userInstance);
            if (errors.length > 0) {
                throw new Error("Validation failed: " + errors.map((err) => err.toString()).join(", "));
            }
        }
    }
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 255],
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            set(value) {
                this.setDataValue("password", value);
            },
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [4, 50],
            },
        },
        isGoogleUser: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        stripeCustomerId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sessionId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        credits: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        type: {
            type: DataTypes.ENUM("normal", "pro"),
            allowNull: false,
            defaultValue: "normal",
            validate: {
                isIn: [["normal", "pro"]],
            },
        },
        role: {
            type: DataTypes.ENUM("user", "admin"),
            allowNull: false,
            validate: {
                isIn: [["user", "admin"]],
            },
        },
        isTwoFactorEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verificationToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isFirstLogin: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        otpExpiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "0.0.0.0",
            validate: {
                notEmpty: true,
            },
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: "User",
        tableName: "users",
        hooks: {
            beforeSave: User.hashPassword,
        },
        paranoid: true,
    });
    User.addHook("beforeCreate", async (user) => {
        await User.validateUser(user);
    });
    User.addHook("beforeUpdate", async (user) => {
        await User.validateUser(user);
    });
    return User;
}
