import { Search } from "lucide-react";
import "./SearchBar.css";

export default function SearchBar({ value, onChange, placeholder = "Cari...", ariaLabel = "Search" }) {
  return (
    <div className="search-card generic-search-card">
      <label className="search-input" htmlFor={ariaLabel.replace(/\s+/g, "-").toLowerCase()}>
        <Search size={20} />
        <input
          id={ariaLabel.replace(/\s+/g, "-").toLowerCase()}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
      </label>
    </div>
  );
}
