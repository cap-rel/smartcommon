import { isArray } from "lodash";

import { cleanForComparison } from "lib/utils";

export const useFilter = (attributes) => {

  const setFiltersForSearchBar = (listItem) => {
    const values = [];
    Object.entries(listItem).forEach(([key, value]) => {
      const searchable = attributes[key].searchall || true;
      switch (attributes[key].type) {
        case "boolean"         : return ;// Non // formulaire
        case "checkbox"        : return ;// Non // formulaire
        case "multiCheckbox": return searchable && values.push(...value); // Inclure les réponses // formulaire
        case "radio"           : return searchable && values.push(value); // Inclure la réponse // formulaire
        case "select"          : return searchable && values.push(value); // Inclure la réponse // formulaire
        case "multiSelect"  : return searchable && values.push(...value); // Inclure les réponses // formulaire
        case "array"           : return searchable && values.push(...value); // Inclure les réponses // formulaire
        case "varchar"         : return searchable && values.push(value); // Inclure la réponse // formulaire
        case "mail"            : return searchable && values.push(value); // Inclure la réponse // formulaire
        case "password"        : return // non // non
        case "phone"           : return searchable && values.push(value); // Inclure la réponse // formulaire
        case "ip"              : return searchable && values.push(value); // Inclure la réponse // formulaire
        case "link"            : return searchable && values.push(value); // Inclure la réponse // formulaire
        case "int"             : return searchable && values.push(value); // Inclure la réponse // réponse exacte ou interval
        case "reel"            : return searchable && values.push(value); // Inclure la réponse // réponse exacte ou interval
        case "double"          : return searchable && values.push(...value); // Inclure la réponse // réponse exacte pour les deux nombres ou interval fusion des deux
        case "price"           : return searchable && values.push(value); // Inclure la réponse // réponse exacte ou interval
        case "pricey"          : return searchable && values.push(value[0]), `${value[0]}${value[1]}`; // Inclure la réponse // réponse exacte ou interval
        case "timestamp"       : return searchable && values.push(value); // Inclure la réponse // réponse exacte ou interval
        case "date"            : return searchable && values.push(value); // Inclure la réponse // réponse exacte ou interval
        case "datetime"        : return searchable && values.push(value); // Inclure la réponse // réponse exacte ou interval
        case "time"            : return searchable && values.push(value); // Inclure la réponse // réponse exacte ou interval
        case "duration"        : return searchable && values.push(value); // Inclure la réponse // réponse exacte ou interval
        case "text"            : return searchable && values.push(value); // Inclure la réponse // réponse exacte
        case "html"            : return searchable && values.push(value); // Inclure la réponse // réponse exacte
        case "address"         : return searchable && values.push(value); // Inclure la réponse // réponse exacte
        case "gps"             : return searchable && values.push(...value); // Inclure les coordonnées // réponse exact pour les deux coordonnées ou pour l'adresse
        case "file"            : return searchable && values.push(value); // Inclure le nom du fichier // réponse exacte
        case "audio"           : return searchable && values.push(value); // Inclure le nom du fichier uniquement sur desktop // réponse exacte uniquement sur desktop
        case "video"           : return searchable && values.push(value); // Inclure le nom du fichier uniquement sur desktop // réponse exacte uniquement sur desktop
        case "photo"           : return searchable && values.push(value); // Inclure le nom du fichier uniquement sur desktop // réponse exacte uniquement sur desktop
        case "signature"       : return ;// non // non
        case "drawing"         : return ;// non // non
        case "color"           : return searchable && values.push(value);
        case "stepper"         : return searchable && values.push(value);
        case "note"            : return searchable && values.push(value);
        // case "fk": return "";

        // default: return "" TODO à voir avec ERIC
      }
    });
    return values.map(value => cleanForComparison(value));
  }

  const searchBarFilter = (list, searchBarValue, filteredValue) => {
    const filteredSearchBarValue = cleanForComparison(searchBarValue);
    if (!filteredValue) return list;
    return list.filter((item) => {
      return setFiltersForSearchBar(item).some((attribute) => {
        return attribute ? attribute.includes(filteredSearchBarValue) : false;
      });
    });
  };

  const smartFiltersStates = Object.fromEntries(Object.entries(attributes).map(([key, attribute]) => [key, { inclusive: null, exclusive: null }]));

  const matchesInclusiveFilter = (attribute, filter) => {
    if (filter.interval) {
      const { min, max } = filter.interval;
      return ((!min || attribute >= min) && (!max || attribute <= max));
    } else if (isArray(filter.value)) {
      return filter.strict
        ? filter.value.length == attribute.length && filter.value.every(val => attribute.includes(val))
        // filter.value.sort().every((val, index) => val === attribute.sort()[index]); Si l'ordre importe
        : filter.value.every(val => attribute.includes(val));
    } else {
      const filterCleanedValue = cleanForComparison(filter.value);
      const attributeCleanedValue = cleanForComparison(attribute);
      return !("strict" in filter) || filter.strict
        ? attributeCleanedValue === filterCleanedValue
        : attributeCleanedValue.includes(filterCleanedValue);
    }
  };

  const matchesExclusiveFilter = (attribute, filter) => {
      if (filter.interval) {
        const { min, max } = filter.interval;
        return ((min ? attribute < min : true) && (max ? attribute > max : true));
      } else if (isArray(filter.value)) {
        return filter.strict
          ? filter.value.length != attribute.length || filter.value.some(val => !attribute.includes(val))
          : filter.value.some(val => !attribute.includes(val));
      } else {
        const filterCleanedValue = cleanForComparison(filter.value);
        const attributeCleanedValue = cleanForComparison(attribute);
        return !("strict" in filter) || filter.strict
          ? attributeCleanedValue !== filterCleanedValue
          : !attributeCleanedValue.includes(filterCleanedValue);
      }
    };

  const smartFilters = (list, filters) => {
    return list.filter((item) => {
      return Object.entries(filters).every(([key, filter]) => {
        const attribute = item[key];
        const { inclusive, exclusive } = filter;
        const isIncluded = inclusive ? matchesInclusiveFilter(attribute, inclusive) : true;
        const isNotExcluded = exclusive ? matchesExclusiveFilter(attribute, exclusive) : true;
        return isIncluded && isNotExcluded;
      });
    });
  };
    // interval => nombre et date|temps
  // can be strict => nombre, string, multiCheckbox, selecteMultiple, array
      
  return { searchBarFilter, smartFilters, smartFiltersStates };
}