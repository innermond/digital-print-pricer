import ProductConfigurator  from './components/ProductConfigurator'

type AppProps = {
  powerText?: string
  initialCategoryId?: string
  initialProductId?: string
  showExportImport?: boolean
}

function App({ powerText, initialCategoryId, initialProductId, showExportImport }: AppProps = {}) {
  return (
    <ProductConfigurator
      priceEndpoint='https://printuridigital.ro/api/pricer/price'
      powerText={powerText}
      initialCategoryId={initialCategoryId}
      initialProductId={initialProductId}
      showExportImport={showExportImport}
    />
  )
}

export default App
