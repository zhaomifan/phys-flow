import React from 'react';
import { physicsQuantities, quantityCategoryNames } from '../data/physicsData';

interface QuantitySelectorProps {
  title: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  excludeIds?: string[];
  color: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  title,
  selected,
  onChange,
  excludeIds = [],
  color
}) => {
  const categories = [...new Set(physicsQuantities.map(q => q.category))];

  const toggleQuantity = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="quantity-selector" style={{ '--accent-color': color } as React.CSSProperties}>
      <div className="selector-header">
        <h2>{title}</h2>
        {selected.length > 0 && (
          <button className="clear-btn" onClick={clearAll}>
            清空
          </button>
        )}
      </div>

      <div className="selected-count">
        已选 <span className="count">{selected.length}</span> 个
      </div>

      <div className="categories">
        {categories.map(category => {
          const quantities = physicsQuantities.filter(
            q => q.category === category && !excludeIds.includes(q.id)
          );
          if (quantities.length === 0) return null;

          return (
            <div key={category} className="category-group">
              <h3 className="category-title">
                {quantityCategoryNames[category] || category}
              </h3>
              <div className="quantity-list">
                {quantities.map(q => (
                  <button
                    key={q.id}
                    className={`quantity-item ${selected.includes(q.id) ? 'selected' : ''}`}
                    onClick={() => toggleQuantity(q.id)}
                  >
                    <span className="symbol">{q.symbol}</span>
                    <span className="name">{q.name}</span>
                    {q.unit && <span className="unit">({q.unit})</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuantitySelector;
