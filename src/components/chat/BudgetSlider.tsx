import React from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import BudgetCard from "./BudgetCard";
import { BudgetDeviation } from "@/services/budget/budgetService";

interface BudgetSliderProps {
  budgets: BudgetDeviation[];
  budgetsLoading: boolean;
  currentSlide: number;
  onSlideChange: (slide: number) => void;
  onLearnMore: (budgetName: string) => void;
}

export default function BudgetSlider({
  budgets,
  budgetsLoading,
  currentSlide,
  onSlideChange,
  onLearnMore,
}: BudgetSliderProps) {
  const totalSlides = Math.ceil(budgets.length / 3);

  if (budgetsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-purple-600">Cargando presupuestos...</span>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 text-sm">No se pudieron cargar los presupuestos</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Slider Container */}
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: totalSlides }, (_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
                {budgets.slice(slideIndex * 3, slideIndex * 3 + 3).map((budget, index) => (
                  <BudgetCard
                    key={slideIndex * 3 + index}
                    budget={budget}
                    onLearnMore={onLearnMore}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onSlideChange(Math.min(totalSlides - 1, currentSlide + 1))}
            disabled={currentSlide === totalSlides - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => onSlideChange(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentSlide === index ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
