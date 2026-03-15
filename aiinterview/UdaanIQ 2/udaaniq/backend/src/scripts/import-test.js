try {
  const aiInterviewRoutes = require('./routes/aiInterviewRoutes');
  console.log('AI Interview Routes imported successfully');
  console.log('Routes object:', typeof aiInterviewRoutes);
} catch (error) {
  console.log('Error importing AI Interview Routes:', error.message);
  console.log('Stack trace:', error.stack);
}