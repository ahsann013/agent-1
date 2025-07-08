// models/User.ts
import { DataTypes, Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import {
  IsString,
  IsEmail,
  Length,
  IsEnum,
  IsBoolean,
  validate,
} from "class-validator";
import { plainToClass } from "class-transformer";

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string;
  username: string;
  isGoogleUser: boolean;
  stripeCustomerId?: string;
  sessionId?: string;
  credits: number;
  type: 'normal' | 'pro';
  role: 'user' | 'admin';
  isTwoFactorEnabled: boolean;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  isFirstLogin: boolean;
  resetPasswordExpires?: Date;
  otp?: string;
  otpExpiry?: Date;
  ipAddress: string;
  lastLogin?: Date;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export default function initUserModel(sequelize: Sequelize) {
  class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public password?: string;
    public username!: string;
    public isGoogleUser!: boolean;
    public stripeCustomerId?: string;
    public sessionId?: string;
    public credits!: number;
    public type!: 'normal' | 'pro';
    public role!: 'user' | 'admin';
    public isTwoFactorEnabled!: boolean;
    public phoneNumber?: string;
    public isActive!: boolean;
    public isEmailVerified!: boolean;
    public verificationToken?: string;
    public resetPasswordToken?: string;
    public isFirstLogin!: boolean;
    public resetPasswordExpires?: Date;
    public otp?: string;
    public otpExpiry?: Date;
    public ipAddress!: string;
    public lastLogin?: Date;
    public profileImage?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt?: Date;

    // Add a hook to hash the password before saving
    static async hashPassword(user: User): Promise<void> {
      if (user.changed("password") && user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }

    // Method to check password validity
    async isValidPassword(password: string): Promise<boolean> {
      return bcrypt.compare(password, this.password || '');
    }

    // Custom validation logic
    static async validateUser(userData: any): Promise<void> {
      const userInstance = plainToClass(User, userData);
      const errors = await validate(userInstance);
      if (errors.length > 0) {
        throw new Error(
          "Validation failed: " + errors.map((err) => err.toString()).join(", ")
        );
      }
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 255], // Ensure name is between 1 and 255 characters
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true, // Ensure email format is correct
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) {
          this.setDataValue("password", value); // Ensure password is stored as is
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [4, 50], // Username should be between 4 and 50 characters
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
          isIn: [["normal", "pro"]], // Ensure role is either student or admin
        },
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        validate: {
          isIn: [["user", "admin"]], // Ensure role is either student or admin
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
        allowNull: true, // Can be null if not yet verified
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
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      hooks: {
        beforeSave: User.hashPassword, // Hook to hash password before saving
      },
      paranoid: true, // Enable soft deletes (adds deletedAt timestamp)
    }
  );

  // Example usage: validate user data before saving to the database
  User.addHook("beforeCreate", async (user: User) => {
    await User.validateUser(user);
  });

  User.addHook("beforeUpdate", async (user: User) => {
    await User.validateUser(user);
  });

  return User;
}
