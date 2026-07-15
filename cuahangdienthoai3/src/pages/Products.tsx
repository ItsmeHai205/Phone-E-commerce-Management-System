import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
// Use products from AppContext instead of static phonesData
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { 
  Filter, 
  RotateCcw, 
  Search, 
  Grid, 
  List, 
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Products.css';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, products } = useApp();

  // Filters State
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(40000000);
  const [selectedRAMs, setSelectedRAMs] = useState<string[]>([]);
  const [selectedROMs, setSelectedROMs] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isListView, setIsListView] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Sync state with URL params
  const searchQuery = searchParams.get('search') || '';
  const brandQuery = searchParams.get('brand') || '';
  const wishlistOnly = searchParams.get('wishlist') === 'true';

  useEffect(() => {
    if (brandQuery) {
      setSelectedBrands([brandQuery]);
    } else {
      setSelectedBrands([]);
    }
  }, [brandQuery]);

  // Clean all filters
  const handleClearFilters = () => {
    setSelectedBrands([]);
    setMaxPrice(40000000);
    setSelectedRAMs([]);
    setSelectedROMs([]);
    setSelectedTags([]);
    setSortBy('featured');
    setSearchParams({}); // Clear query parameters
  };

  // Get available filter values dynamically
  const uniqueBrands = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google'];
  const ramOptions = ['6 GB', '8 GB', '12 GB', '16 GB'];
  const romOptions = ['128 GB', '256 GB', '512 GB', '1 TB'];
  const tagOptions = ['New', 'Best Seller', 'Hot Deal'];

  // Handle individual filter toggles
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    // Clear URL brand param if manually editing checklist
    if (brandQuery) {
      searchParams.delete('brand');
      setSearchParams(searchParams);
    }
  };

  const handleRamToggle = (ram: string) => {
    setSelectedRAMs(prev => 
      prev.includes(ram) ? prev.filter(r => r !== ram) : [...prev, ram]
    );
  };

  const handleRomToggle = (rom: string) => {
    setSelectedROMs(prev => 
      prev.includes(rom) ? prev.filter(r => r !== rom) : [...prev, rom]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Compute final filtered & sorted list
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Wishlist Only (if URL ?wishlist=true)
    if (wishlistOnly) {
      result = result.filter(phone => wishlist.includes(phone.id));
    }

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        phone => 
          phone.name.toLowerCase().includes(q) || 
          phone.brand.toLowerCase().includes(q) ||
          phone.description.toLowerCase().includes(q)
      );
    }

    // Brands filter
    if (selectedBrands.length > 0) {
      result = result.filter(phone => selectedBrands.includes(phone.brand));
    }

    // Price filter
    result = result.filter(phone => {
      const actualPrice = phone.basePrice * (1 - phone.discount / 100);
      return actualPrice <= maxPrice;
    });

    // RAM filter
    if (selectedRAMs.length > 0) {
      result = result.filter(phone => {
        return selectedRAMs.some(ram => phone.specs.ram.includes(ram));
      });
    }

    // ROM/Storage filter
    if (selectedROMs.length > 0) {
      result = result.filter(phone => {
        return selectedROMs.some(rom => phone.specs.rom.includes(rom));
      });
    }

    // Tags filter
    if (selectedTags.length > 0) {
      result = result.filter(phone => selectedTags.includes(phone.tag));
    }

    // Apply Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => {
          const priceA = a.basePrice * (1 - a.discount / 100);
          const priceB = b.basePrice * (1 - b.discount / 100);
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const priceA = a.basePrice * (1 - a.discount / 100);
          const priceB = b.basePrice * (1 - b.discount / 100);
          return priceB - priceA;
        });
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default "featured" - no sorting
        break;
    }

    return result;
  }, [searchQuery, wishlistOnly, wishlist, selectedBrands, maxPrice, selectedRAMs, selectedROMs, selectedTags, sortBy]);

  return (
    <div className="products-page container">
      {/* Title / Search indicators */}
      <div className="products-header">
        <div>
          <h1 className="page-title">
            {wishlistOnly ? 'Sản Phẩm Yêu Thích' : 'Danh Sách Sản Phẩm'}
          </h1>
          {searchQuery && (
            <p className="search-result-desc">
              Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong> ({filteredProducts.length} sản phẩm)
            </p>
          )}
          {wishlistOnly && (
            <p className="search-result-desc">
              Đang xem {filteredProducts.length} sản phẩm bạn đã lưu thích.
            </p>
          )}
        </div>

        {/* Toolbar controls */}
        <div className="products-toolbar glass-panel">
          <button 
            className="btn btn-secondary mobile-filter-trigger"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter size={16} />
            Bộ lọc
          </button>

          <div className="view-toggle-buttons">
            <button 
              onClick={() => setIsListView(false)} 
              className={`view-btn ${!isListView ? 'active' : ''}`}
              title="Dạng lưới"
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setIsListView(true)} 
              className={`view-btn ${isListView ? 'active' : ''}`}
              title="Dạng danh sách"
            >
              <List size={18} />
            </button>
          </div>

          <div className="sort-wrapper">
            <span className="sort-label">Sắp xếp:</span>
            <div className="select-container">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="name-asc">Tên: A - Z</option>
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="products-layout-grid">
        {/* Sidebar Filters (Desktop) */}
        <aside className="filters-sidebar glass-panel">
          <div className="sidebar-header">
            <h3><Filter size={18} /> Bộ lọc tìm kiếm</h3>
            <button onClick={handleClearFilters} className="clear-filters-btn">
              <RotateCcw size={12} />
              Xóa lọc
            </button>
          </div>

          {/* Brands Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">Thương hiệu</h4>
            <div className="checklist">
              {uniqueBrands.map(brand => (
                <label key={brand} className="checklist-label">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                  />
                  <span className="checkbox-custom"></span>
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">
              Giá tối đa: <span className="price-display">{(maxPrice / 1000000).toFixed(0)}trđ</span>
            </h4>
            <input
              type="range"
              min={10000000}
              max={40000000}
              step={1000000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-slider"
            />
            <div className="slider-limits">
              <span>10 trđ</span>
              <span>40 trđ</span>
            </div>
          </div>

          {/* RAM Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">Dung lượng RAM</h4>
            <div className="checklist">
              {ramOptions.map(ram => (
                <label key={ram} className="checklist-label">
                  <input
                    type="checkbox"
                    checked={selectedRAMs.includes(ram)}
                    onChange={() => handleRamToggle(ram)}
                  />
                  <span className="checkbox-custom"></span>
                  <span>{ram}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ROM Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">Bộ nhớ trong (ROM)</h4>
            <div className="checklist">
              {romOptions.map(rom => (
                <label key={rom} className="checklist-label">
                  <input
                    type="checkbox"
                    checked={selectedROMs.includes(rom)}
                    onChange={() => handleRomToggle(rom)}
                  />
                  <span className="checkbox-custom"></span>
                  <span>{rom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Badges/Tags Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">Trạng thái</h4>
            <div className="checklist">
              {tagOptions.map(tag => (
                <label key={tag} className="checklist-label">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  <span className="checkbox-custom"></span>
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Cards Container */}
        <main className="products-main">
          {filteredProducts.length === 0 ? (
            <div className="no-products glass-panel text-center">
              <Search size={48} className="no-products-icon" />
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử xóa bớt bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
              <button onClick={handleClearFilters} className="btn btn-primary">
                Làm mới bộ lọc
              </button>
            </div>
          ) : (
            <div className={isListView ? 'products-list-layout' : 'products-grid-layout'}>
              {filteredProducts.map(phone => (
                <div key={phone.id} className="grid-item-wrapper">
                  <ProductCard phone={phone} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
            />
            {/* Drawer */}
            <motion.div 
              className="drawer-content glass-panel-heavy"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header">
                <h3>Bộ lọc tìm kiếm</h3>
                <button onClick={() => setShowMobileFilters(false)} className="btn-close">×</button>
              </div>
              <div className="drawer-body">
                {/* Same content as desktop sidebar */}
                <div className="filter-group">
                  <h4 className="filter-group-title">Thương hiệu</h4>
                  <div className="checklist">
                    {uniqueBrands.map(brand => (
                      <label key={brand} className="checklist-label">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                        />
                        <span className="checkbox-custom"></span>
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">
                    Giá tối đa: <span className="price-display">{(maxPrice / 1000000).toFixed(0)}trđ</span>
                  </h4>
                  <input
                    type="range"
                    min={10000000}
                    max={40000000}
                    step={1000000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="price-slider"
                  />
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">Dung lượng RAM</h4>
                  <div className="checklist">
                    {ramOptions.map(ram => (
                      <label key={ram} className="checklist-label">
                        <input
                          type="checkbox"
                          checked={selectedRAMs.includes(ram)}
                          onChange={() => handleRamToggle(ram)}
                        />
                        <span className="checkbox-custom"></span>
                        <span>{ram}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">Bộ nhớ trong (ROM)</h4>
                  <div className="checklist">
                    {romOptions.map(rom => (
                      <label key={rom} className="checklist-label">
                        <input
                          type="checkbox"
                          checked={selectedROMs.includes(rom)}
                          onChange={() => handleRomToggle(rom)}
                        />
                        <span className="checkbox-custom"></span>
                        <span>{rom}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="drawer-footer">
                <button onClick={handleClearFilters} className="btn btn-secondary w-full">
                  Xóa bộ lọc
                </button>
                <button onClick={() => setShowMobileFilters(false)} className="btn btn-primary w-full">
                  Áp dụng bộ lọc
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
