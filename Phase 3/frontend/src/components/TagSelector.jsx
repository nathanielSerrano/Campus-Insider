import { useState, useEffect } from "react";

export default function TagSelector({ selectedTags = [], setSelectedTags, placeholder, fetchUrl}) {
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
  

    useEffect(() => {
        if (!fetchUrl) return;
        fetch(fetchUrl)
          .then(res => res.json())
          .then(data => setOptions(data.tags || []))
          .catch(console.error);
      }, [fetchUrl]);
  
    const handleInputChange = (e) => {
      const value = e.target.value;
      setInputValue(value);
  
      const filtered = options.filter(tag =>
        tag.toLowerCase().startsWith(value.toLowerCase()) &&
        !selectedTags.includes(tag)
      );
      setSuggestions(filtered);
    };
  
    const addTag = (tag) => {
      setSelectedTags([...selectedTags, tag]);
      setInputValue("");
      setSuggestions([]);
    };
  
    const removeTag = (tag) => {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    };

    function formatTag(tag) {
      return tag.replace(/_/g, " ");
    }
  
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <div key={tag} className="bg-white/20 text-white px-2 py-1 rounded-full border border-white/30 flex items-center gap-1 backdrop-blur">
            {tag} <button className="text-red-500 px-2 m-0 bg-inherit rounded border-white/30 backdrop-blur" onClick={() => removeTag(tag)}>&times;</button>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="border px-2 py-1 rounded w-full"
        />
        {suggestions.length > 0 && (
          <ul className="border rounded bg-gray-600 mt-1 max-h-32 overflow-auto">
            {suggestions.map(tag => (
              <li
                key={tag}
                className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                onClick={() => addTag(tag)}
              >
                {formatTag(tag)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }