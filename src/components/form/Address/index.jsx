import { useRef } from 'react';
import { useStates, useValue } from '../../../hooks';
import { Spinner } from '../../others';
import { Input, Label } from '../../form';
import { isEmpty, isNil } from '../../../globals/functions';
import { propTypes } from './props';
import { FaSearchLocation } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { addressVariants } from './variants';

// TODO Find a way to replace input focus condition

export const Address = ({
  id,
  label,
  help,
  icon,
  prefix,
  suffix,
  hasCopyButton = false,
  required = false,
  readOnly = false,
  disabled = false,
  // patternError,
  loading = false,

  // name,
  defaultValue,
  value,
  onValueChange = () => {},

  variant = "smart",

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  childrenContainerProps,
  prefixProps,
  suffixProps,

  inputContainerProps,
  inputSpinnerProps,
  inputIconProps,
  listProps,
  listItemProps,
  ...props
}) => {

  // const labelPs = { id, label, help, prefix, suffix, required, readOnly, disabled, variants: addressVariants, variant, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, childrenContainerProps, prefixProps, suffixProps };


  const { states, set } = useStates({
    suggestions: [],
    isSearching: false,
  });

  const { suggestions, isSearching } = states;

  const { currentValue, setValue } = useValue(defaultValue ?? "", value, onValueChange);

  const fetchSuggestions = async (query) => {
    await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`)
      .then(response => response.json())
      .then(json => {
        const suggestions = json.map((item) => {        
          const { house_number, building_number, road, street, highway, postcode, zipcode, postal_code, city, municipality, town, village, hamlet, country, state, nation } = item.address;

          const finalNumber   = house_number ?? building_number ?? "";
          const finalRoad     = road ?? street ?? highway ?? "";
          const finalCode     = postcode ?? zipcode ?? postal_code ?? "";
          const finalCity     = city ?? municipality ?? town ?? village ?? hamlet ?? "";
          const finalCountry  = country ?? state ?? nation ?? "";

          return `${finalNumber && finalNumber + " "}${finalRoad && finalRoad + " "}${finalCode && finalCode + " "}${finalCity && finalCity + " "}${finalCountry}`;
        });
  
        set("suggestions", suggestions);
      })
      .catch(error => console.error(error.message));
    set("isSearching", false);
  };

  const searchTimeoutRef = useRef(null);

  const handleInputOnChange = (newValue) => {
    set("suggestions", []);
    setValue(newValue);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (newValue.trim().length > 4) {
      set("isSearching", true);
      searchTimeoutRef.current = setTimeout(() => fetchSuggestions(newValue), 1000);
    } else {
      set("isSearching", false);
    }
  };

  const handleSelectionOnClick = (newValue) => {
    setValue(newValue)
    set("suggestions", []);
  };

  return (
    <Label
      id={id}
      label={label}
    >
      <div 
        { ...inputContainerProps}
        className={twMerge(`relative`, inputContainerProps?.className)}
      >
        <Input
          type={`varchar`}
          loading={isSearching}
          icon={<FaSearchLocation />}
          placeholder={`Rechercher une adresse...`}
          onValueChange={handleInputOnChange}
          value={currentValue}
        />
        {(!isEmpty(suggestions)) && (
          <ul 
            { ...listProps}
            className={twMerge(`absolute z-10 top-[calc(100%+4px)] max-h-80 left-0 right-0 bg-strong col border border-strong-border rounded-md overflow-y-auto shadow-2xl`, listProps?.className)}
          >
            {states.suggestions.map((suggestion, index) => {
              // if (cleanForComparison(suggestion).includes(cleanForComparison(states.searchBarValue))) {
                return (
                  <li
                    key={index}
                    { ...listItemProps}
                    onClick={() => handleSelectionOnClick(suggestion)}
                    className={twMerge(`p-2 duration-100 bg-strong active:brightness-soft`, listItemProps?.className)}
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