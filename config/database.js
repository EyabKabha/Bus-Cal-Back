const Sequelize = require('sequelize');

// const sequelize=new Sequelize('buscal','root','123456',{
//         host:'localhost',
//         dialect:'mysql'
//     });

    const sequelize=new Sequelize('buscal','amalk','Ak8752993!!',{
        host:'localhost',
        dialect:'mysql'
    });

    // const sequelize=new Sequelize('buscal','root','Mariam2305!@',{
    //     host:'45.88.72.5',
    //     dialect:'mysql'
    // });

//console.log(sequelize.config);
module.exports=sequelize;