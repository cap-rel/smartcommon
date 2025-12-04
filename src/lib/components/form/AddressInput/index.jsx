import { useRef } from 'react';
import { FaSearchLocation } from 'react-icons/fa';

import { useStates, useLocalValue, useVariantMerger } from 'lib/hooks';
import { Label, Input } from 'lib/components';
import { isEmpty } from 'lib/utils';

import { propTypes } from './props';

// TODO Find a way to replace input focus condition

// {
//   id,
//   label,
//   help,
//   icon,
//   prefix,
//   suffix,
//   hasCopyButton = false,
//   required = false,
//   readOnly = false,
//   disabled = false,
//   // patternError,
//   loading = false,

//   // name,
//   defaultValue,
//   value,
//   onValueChange = () => {},

//   variant = "smart",

//   containerProps,
//   labelContainerProps,
//   labelProps,
//   requiredStarProps,
//   helpProps,
//   childrenContainerProps,
//   prefixProps,
//   suffixProps,

//   inputContainerProps,
//   inputSpinnerProps,
//   inputIconProps,
//   listProps,
//   listItemProps,
//   ...props
// }

export const AddressInput = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("AddressInput", props);

  const { 
    id,
    defaultValue,
    value,
    onChange,
    onError
  } = variantProps;

  const initialStates = {
    suggestions: [],
    isSearching: false,
  };

  const { states, set } = useStates({ initialStates });

  const { suggestions, isSearching } = states;

  const errors = {};
  
  const { currentValue, setValue } = useLocalValue(defaultValue ?? "", value, onChange, errors, onError, id);

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
      { ...variantProps}
      errors={errors}
      mergeProps={mergeProps}
    >
      <div { ...mergeProps("relativeContainer", props => ({
        ...props,
        className: `relative`
      }))}>
        <Input { ...mergeProps("Input", props => ({
          ...props,
          // variant varchar
          loading: isSearching,
          inputIcon: <FaSearchLocation />,
          placeholder: `Rechercher une adresse...`,
          onChange: value => {
            handleInputOnChange(value)
          },
          value: currentValue,
        }))}
         
        />
        {(!isEmpty(suggestions)) && (
          <ul { ...mergeProps("suggestionsContainer", props => ({
            ...props,
            className: `absolute z-10 top-[calc(100%+4px)] max-h-80 left-0 right-0 bg-strong col border border-strong-border rounded-md overflow-y-auto shadow-2xl`
          }))}>
            {suggestions.map((suggestion, SI) => {
              // if (cleanForComparison(suggestion).includes(cleanForComparison(states.searchBarValue))) {
                return (
                  <li key={`suggestion${SI}`} { ...mergeProps("suggestion", props => ({
                    ...props,
                    onClick: () => handleSelectionOnClick(suggestion),
                    className: `p-2 duration-100 bg-strong active:brightness-soft`
                  }))}>
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

AddressInput.propTypes = propTypes;