import React from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Header = () => {
  return (
    <div className="flex justify-between px-8 py-2">
      <div className="flex items-center">
        <Bars3Icon className="w-6 h-6 text-[#1A9BFF] text-2xl" />
        <span className="text-[#1A9BFF] font-bold text-2xl">QuickBasket</span>
      </div>
      <div class="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-[#1A9BFF]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>
      </div>
      <div className="flex">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-[#1A9BFF]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5.121 17.804A9.003 9.003 0 0112 15a9.003 9.003 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>Sign Up/Sign In</span>
      </div>
      <div className="flex">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-[#1A9BFF]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11L17 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
          />
        </svg>
        <span>Cart</span>
      </div>
      <div>
        <div class="relative group text-sm text-gray-700 hover:text-[#1A9BFF] cursor-pointer">
          <div class="flex items-center gap-1">
            <span>Groceries</span>
            <svg
              class="w-3 h-3 mt-[2px] group-hover:rotate-180 transition-transform"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <div class="absolute left-0 mt-1 w-40 hidden group-hover:block bg-white border border-gray-200 rounded shadow-sm z-50">
            <a
              href="#"
              class="block px-4 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100"
            >
              Vegetables
            </a>
            <a
              href="#"
              class="block px-4 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100"
            >
              Fruits
            </a>
            <a
              href="#"
              class="block px-4 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100"
            >
              Snacks
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
