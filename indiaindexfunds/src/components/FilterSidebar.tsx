import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ChevronLeft, ChevronRight, Grid3X3, List } from 'lucide-react';

interface FilterGroup {
  title: string;
  options: string[];
  selected: string;
}

interface FilterSidebarProps {
  filters: {
    fundType: string;
    assetType: string;
    listedAt: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
}

const FilterSidebar = ({ filters, onFilterChange, isCollapsed, onToggleCollapse, viewMode, onViewModeChange }: FilterSidebarProps) => {
  const filterGroups: FilterGroup[] = [
    {
      title: 'Fund Type',
      options: ['All', 'ETF', 'Index Fund'],
      selected: filters.fundType
    },
    {
      title: 'Asset Type',
      options: ['All', 'Equity', 'Debt'],
      selected: filters.assetType
    },
    {
      title: 'Listed At',
      options: ['All', 'NSE', 'BSE'],
      selected: filters.listedAt
    }
  ];

  const FilterButtonGroup = ({ group }: { group: FilterGroup }) => {
    const getFilterType = (title: string) => {
      switch (title) {
        case 'Fund Type': return 'fundType';
        case 'Asset Type': return 'assetType';
        case 'Listed At': return 'listedAt';
        default: return 'fundType';
      }
    };

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">{group.title}</h3>
        <div className="flex gap-2">
          {group.options.map((option) => (
            <Button
              key={option}
              variant={option === group.selected ? "default" : "secondary"}
              size="sm"
              className={`text-xs transition-all duration-200 ${
                option === group.selected
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
              onClick={() => onFilterChange(getFilterType(group.title), option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Collapse/Expand Button */}
      <Button
        onClick={onToggleCollapse}
        variant="outline"
        size="sm"
        className="absolute -right-3 top-6 z-10 bg-background border-border shadow-md hover:shadow-lg transition-all duration-200"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ x: -50, opacity: 0, width: 0 }}
            animate={{ x: 0, opacity: 1, width: 'auto' }}
            exit={{ x: -50, opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full lg:w-80 bg-card border border-border rounded-lg p-6 h-fit sticky top-24 lg:top-8"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Filter</h2>
            </div>

            {/* Main Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl font-bold text-foreground mb-8 leading-tight"
            >
              Find the Best Index Funds & ETFs
            </motion.h1>

            {/* Filter Groups */}
            <div className="space-y-8">
              {filterGroups.map((group, index) => (
                <motion.div
                  key={group.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <FilterButtonGroup group={group} />
                </motion.div>
              ))}

              {/* View Mode Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-medium text-foreground">View Mode</h3>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'cards' ? "default" : "secondary"}
                    size="sm"
                    className={`flex-1 transition-all duration-200 ${
                      viewMode === 'cards'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    onClick={() => onViewModeChange('cards')}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Grid View
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "secondary"}
                    size="sm"
                    className={`flex-1 transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    onClick={() => onViewModeChange('list')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List View
                  </Button>
                </div>
              </motion.div>

              {/* Dropdown Filters */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Screener View</label>
                  <Select defaultValue="overview">
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="comparison">Comparison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Benchmark Source</label>
                  <Select>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nse">NSE</SelectItem>
                      <SelectItem value="bse">BSE</SelectItem>
                      <SelectItem value="amfi">AMFI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSidebar;