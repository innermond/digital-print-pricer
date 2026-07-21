import ProductConfigurator  from './components/ProductConfigurator'

function App({ powerText }: { powerText?: string } = {}) {
  return <ProductConfigurator priceEndpoint='https://printuridigital.ro/api/pricer/price' powerText={powerText} />
}

export default App
