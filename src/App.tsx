import ProductConfigurator  from './components/ProductConfigurator'

type AppProps = {
  powerText?: string
  initialCategoryId?: string
  initialProductId?: string
}

function App({ powerText, initialCategoryId, initialProductId }: AppProps = {}) {
  return (
    <ProductConfigurator
      priceEndpoint='https://printuridigital.ro/api/pricer/price'
      powerText={powerText}
      initialCategoryId={initialCategoryId}
      initialProductId={initialProductId}
    />
  )
}

export default App
