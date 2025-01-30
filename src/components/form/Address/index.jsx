import { useRef } from 'react';
import { useStates } from '../../hooks';
import Spinner from '../../others/Spinner';
import { Label } from '../../dol';
import { cleanForComparison, isEmpty, isUndefined } from '../../../globals/functions';
import { propTypes } from './props';

export const Address = ({
  label = null, 
  id = null,
  help = null,
  placeholder = null,
  min = null,
  size = null,
  max = null,
  pattern = null,
  readOnly = false,
  required = false, 
  disabled = false,   
  value, 
  onChange = () => {},
  className = null,
  color = null
}) => {
  const finalPlaceholder = isUndefined(placeholder) ? "Rechercher une addresse ..." : placeholder;

  const labelProps = { id, label, required, help, className };
  const inputProps = { id, placeholder: finalPlaceholder, required, disabled };

  const { states, set } = useStates({
    suggestions: [],
    isSearching: false,
    isInputFocused: false
  });

  const { suggestions, isSearching, isInputFocused } = states;

  const searchTimeoutRef = useRef(null);

  const handleInputOnChange = (e) => {
    set("suggestions", []);
    const value = e.target.value;
    onChange(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length > 4) {
      set("isSearching", true);
      searchTimeoutRef.current = setTimeout(() => fetchSuggestions(value), 1000);
    } else {
      set("isSearching", false);
    }
  };

  const fetchSuggestions = async (query) => {
    await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`)
      .then(response => response.json())
      .then(json => {
        const suggestions = json.map((item) => {        
          const { house_number, building_number, road, street, highway, postcode, zipcode, postal_code, city, municipality, town, village, hamlet, country, state, nation } = item.address;

          const finalNumber   = house_number || building_number || "";
          const finalRoad     = road || street || highway || "";
          const finalCode     = postcode || zipcode || postal_code || "";
          const finalCity     = city || municipality || town || village || hamlet || "";
          const finalCountry  = country || state || nation || "";

          return `${finalNumber && finalNumber + " "}${finalRoad && finalRoad + " "}${finalCode && finalCode + " "}${finalCity && finalCity + " "}${finalCountry}`;
        });
  
        set("suggestions", suggestions);
      })
      .catch(error => console.error(error.message));
    set("isSearching", false);
  };

  return (
    <Label { ...labelProps}>
      <div className={`relative`}>
        <div className={`relative w-full`}>
          <input
            onFocus={() => set("isInputFocused", true)}
            onBlur={() => set("isInputFocused", false)}
            value={value}
            onChange={handleInputOnChange}
            className={`focus:ring-1 ring-primary w-full py-2 pl-2 pr-7 truncate border border-dol bg-transparent outline-none focus:border-primary rounded-md`}
            { ...inputProps}
          />
          {isSearching && 
            <span className={`absolute-v-center right-2 z-10 pointer-events-none`}>
              <Spinner size={1}/>
            </span>
          }
        </div>
        {(!isEmpty(suggestions) && isInputFocused) && (
          <ul className={`absolute z-10 top-[calc(100%+4px)] max-h-80 left-0 right-0 bg-dol col border border-dol rounded-md overflow-y-auto`}>
            {states.suggestions.map((suggestion, index) => {
              // if (cleanForComparison(suggestion).includes(cleanForComparison(states.searchBarValue))) {
                return (
                  <li
                    key={index}
                    onMouseDown={() => {
                      onChange(suggestion);
                      set("suggestions", []);
                    }}
                    className={`p-2 button-dol bg-soft-dol cursor-pointer`}
                  >
                    {suggestion}
                  </li>
                );
              // }
            })}
          </ul>
        )}
      </div>
    </Label>
  );
};

Address.propTypes = propTypes;