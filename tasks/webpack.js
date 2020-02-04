import path    from 'path'
import webpack from 'webpack'
import process from 'process'

const isProduction = (process.env.NODE_ENV === 'production')

let config = {

    entry: './index.js',

    output: {
        filename: './js/bundle.js',
        path: path.resolve(__dirname, '../dist')
    },

    context: path.resolve(__dirname, '../src'),

    plugins: isProduction ? [ new config.optimization.minimize() ] : []
}


function scripts() {

    return new Promise(resolve => webpack(config, (err, stats) => {

        if(err) console.log('Webpack', err)

        console.log(stats.toString({ /* stats options */ }))

        resolve()
    }))
}

module.exports = { config, scripts }
