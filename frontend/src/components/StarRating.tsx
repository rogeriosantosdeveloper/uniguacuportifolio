'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void; // Torna opcional para exibição
  readOnly?: boolean; // Para exibir estrelas sem permitir clique
}

export function StarRating({ rating, setRating, readOnly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button" // Evita submit do formulário
          className={`text-2xl ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${
            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => !readOnly && setRating && setRating(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
    </div>
  );
}