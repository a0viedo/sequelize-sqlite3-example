const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

(async () => {
  try {

    const types = {
      get string() {
        return { type: DataTypes.STRING }
      }
    };

    const User = sequelize.define('User', {
      firstName: types.string,
      lastName: types.string,
      email: types.string,
      password: types.string
    }, {
      defaultScope: {
        attributes: {
          exclude: ['password']
        }
      }
    });

    const Product = sequelize.define('Product', {
      description: types.string,
      price: types.string,
    });

    const Company = sequelize.define('Company', {
      name: types.string,
      url: types.string,
    });

    const PurchaseOrder = sequelize.define('PurchaseOrder', {
      totalCost: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
    });

    // one-to-many
    Company.hasMany(Product, {
      as: 'products',
      foreignKey: {
        name: 'companyId',
        allowNull: false
      }
    });
    Product.belongsTo(Company, {
      as: 'company',
      foreignKey: {
        name: 'companyId',
        allowNull: false
      }
    });

    // one-to-many
    User.hasMany(PurchaseOrder, {
      as: 'purchaseOrders',
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    });
    PurchaseOrder.belongsTo(User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    });

    // many-to-many
    Product.belongsToMany(PurchaseOrder, {
      through: 'ProductPurchaseOrder',
      as: 'purchaseOrders'
    });
    PurchaseOrder.belongsToMany(Product, {
      through: 'ProductPurchaseOrder',
      as: 'products'
    });

    await sequelize.sync({ force: true });
    const company = await Company.create({
      name: 'Coca Cola'
    });

    const product = await Product.create({
      description: 'baggio',
      price: 55.99,
      companyId: company.id
    });

    const user = await User.create({
      firstName: 'pedro',
      password: '123456'
    });

    const po = await PurchaseOrder.create({
      totalCost: 200,
      userId: user.id
    });

    await po.setProducts([product.id]);

    const userFind = await User.findByPk(1);
    console.log('Query for a User:')
    console.log(userFind.toJSON());

    const poFind = await PurchaseOrder.findByPk(1, {
      include: [{ association: 'user' }]
    });

    console.log('Query for a PurchaseOrder that includes its user:');
    console.log(poFind.toJSON());

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})()