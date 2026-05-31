import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { CataloguePage } from '../features/catalogue/CataloguePage'
import { CustomersPage } from '../features/customers/CustomersPage'
import { CustomerDetailPage } from '../features/customers/CustomerDetailPage'
import { JobDetailPage } from '../features/jobs/JobDetailPage'
import { QuotesPage } from '../features/quote/QuotesPage'
import { QuoteBuilderPage } from '../features/quote/QuoteBuilderPage'
import { QuoteOutputPage } from '../features/output/QuoteOutputPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/customers" replace /> },
      { path: 'catalogue', element: <CataloguePage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:customerId', element: <CustomerDetailPage /> },
      { path: 'customers/:customerId/jobs/:jobId', element: <JobDetailPage /> },
      { path: 'quotes', element: <QuotesPage /> },
      { path: 'quotes/new', element: <QuoteBuilderPage /> },
      { path: 'quotes/:quoteId', element: <QuoteBuilderPage /> },
      { path: 'quotes/:quoteId/output', element: <QuoteOutputPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
