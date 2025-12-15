import api from './api';

export const reportService = {
  getDashboard: (startDate, endDate) => {
    return api.get('/api/reports/dashboard', {
      params: { start_date: startDate, end_date: endDate },
    });
  },

  getDailyReport: (date) => {
    return api.get('/api/reports/daily', { params: { date } });
  },

  getWeeklyReport: (year, week) => {
    return api.get('/api/reports/weekly', { params: { year, week } });
  },

  getMonthlyReport: (year, month) => {
    return api.get('/api/reports/monthly', { params: { year, month } });
  },

  getQuarterlyReport: (year, quarter) => {
    return api.get('/api/reports/quarterly', { params: { year, quarter } });
  },

  getChartData: (type, period) => {
    return api.get('/api/reports/chart', { params: { type, period } });
  },

  exportReport: (type, format, filters = {}) => {
    return api.get('/api/reports/export', {
      params: { type, format, ...filters },
      responseType: 'blob',
    });
  },
};

