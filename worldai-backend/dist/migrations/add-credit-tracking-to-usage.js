'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('usages', 'sessionId', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Session identifier to group related usage records'
        });
        await queryInterface.addColumn('usages', 'functionName', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Name of the specific function or API called'
        });
        await queryInterface.addColumn('usages', 'creditCost', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Credit cost for this specific function call'
        });
        await queryInterface.addColumn('usages', 'requestPayload', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON of the request parameters (sanitized)'
        });
        await queryInterface.addColumn('usages', 'usageMetadata', {
            type: Sequelize.JSONB,
            allowNull: true,
            comment: 'Additional metadata about the usage (e.g., model used, service provider)'
        });
        await queryInterface.addIndex('usages', ['functionName']);
        await queryInterface.addIndex('usages', ['userId', 'createdAt']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('usages', 'sessionId');
        await queryInterface.removeColumn('usages', 'functionName');
        await queryInterface.removeColumn('usages', 'creditCost');
        await queryInterface.removeColumn('usages', 'requestPayload');
        await queryInterface.removeColumn('usages', 'usageMetadata');
        await queryInterface.removeIndex('usages', ['functionName']);
        await queryInterface.removeIndex('usages', ['userId', 'createdAt']);
    }
};
export {};
