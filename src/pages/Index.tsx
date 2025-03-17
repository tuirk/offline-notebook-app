
import React from 'react';
import Layout from '../components/Layout';
import { AppProvider } from '../context/AppContext';
import AppContent from '../components/projects/AppContent';

const Index = () => {
  return (
    <AppProvider>
      <Layout>
        <AppContent />
      </Layout>
    </AppProvider>
  );
};

export default Index;
