import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, User, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getFundDetail, FundDetailData } from '@/lib/fundData';



const FundDetail = () => {
  const { fundId } = useParams<{ fundId: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'aum' | 'nav'>('aum');
  const [timeRange, setTimeRange] = useState<'6M' | '1Y' | '3Y' | '5Y' | 'sinceInception'>('6M');

  // Get fund data from service
  const fundData = getFundDetail(fundId || '1');

  // Handle case when fund is not found
  if (!fundData) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Fund Not Found</h1>
            <p className="text-muted-foreground mb-6">The fund you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              Back to Funds
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getReturnColor = () => {
    if (fundData.returnPercentage > 0) return 'text-positive';
    if (fundData.returnPercentage < 0) return 'text-negative';
    return 'text-neutral';
  };

  const getReturnIcon = () => {
    if (fundData.returnPercentage > 0) return <TrendingUp className="h-4 w-4" />;
    if (fundData.returnPercentage < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const timeRangeOptions = [
    { value: '6M', label: '6M' },
    { value: '1Y', label: '1Y' },
    { value: '3Y', label: '3Y' },
    { value: '5Y', label: '5Y' },
    { value: 'sinceInception', label: 'Since Inception' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar searchQuery="" onSearchChange={() => {}} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Funds
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Fund Information */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Fund Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Fund Logo */}
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {fundData.name.split(' ')[0][0]}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {fundData.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{fundData.fundType}</span>
                    <span>•</span>
                    <span>{fundData.fundCategory}</span>
                    <span>•</span>
                    <span className="text-negative">{fundData.riskLevel}</span>
                  </div>
                </div>
                             </div>
             </div>

            {/* Fund Description */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">FUND DESCRIPTION</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {fundData.description}
                </p>
              </CardContent>
            </Card>

            {/* Fund Details */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Benchmark Index</h3>
                      <p className="text-lg font-semibold text-foreground">{fundData.benchmark}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Fund Manager</h3>
                      <div className="flex flex-wrap gap-2">
                        {fundData.fundManagers.map((manager, index) => (
                          <span key={index} className="text-lg font-semibold text-foreground">
                            {manager}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Launched Date</h3>
                      <p className="text-lg font-semibold text-foreground">{fundData.launchDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Right Section - Financial Data & Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Financial Metrics Tabs */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'aum' | 'nav')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="aum">AUM</TabsTrigger>
                    <TabsTrigger value="nav">NAV</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="aum" className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {fundData.aum}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        As of {fundData.navDate}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="nav" className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {fundData.nav}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        As of {fundData.navDate}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Performance Chart */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Performance</h3>
                    <div className="flex gap-2">
                      {timeRangeOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={timeRange === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTimeRange(option.value as any)}
                          className="text-xs"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={fundData.performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.1)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Metrics */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Return (1Y)</p>
                    <div className={`flex items-center gap-1 text-lg font-semibold ${getReturnColor()}`}>
                      {getReturnIcon()}
                      <span>{fundData.returnPercentage.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expense Ratio</p>
                    <p className="text-lg font-semibold text-foreground">{fundData.expenseRatio.toFixed(2)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex gap-4 justify-center"
        >
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Invest Now
          </Button>
          <Button variant="outline" size="lg">
            Compare Funds
          </Button>
        </motion.div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default FundDetail; 