import React from 'react';
import MealCard from './MealCard';

export default function FavoritesList({ favorites, expandedId, onExpand, onRemove }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {favorites.map(favorite => (
        <MealCard
          key={favorite.id}
          meal={favorite}
          expanded={expandedId === favorite.id}
          onExpand={() => onExpand(favorite.id)}
          isFavorite={true}
          onRemove={onRemove}
          showSave={false}
          showRemove={true}
        />
      ))}
    </div>
  );
} 