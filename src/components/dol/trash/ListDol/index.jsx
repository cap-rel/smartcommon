import { List, ListGroup, ListItem } from "konsta/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchBarFilter, timestampToDate } from "../../../../globals/functions";
import SearchBarDol from "../../others/SearchbarDol";

/**
 * @param {*} props
 * @param {*} list (array) Eléments à lister
 * @param {*} listGroup (string) Attribut de l'objet sous lequel les éléments sont regroupés (ex: date)
 * @param {*} listGroupDate (bool) True si les éléments sont regroupés par date (réalise la conversion timestamp en date)
 * @param {*} label (string) Attribut de l'objet affiché (ex: label)
 * @param {*} status (*) Status (icône, mot, nombre)
 * @param {*} to (string) Lien
 * @param {*} state (*) Données transmises à la page suivante.
 * @param {*} searchOn (string) Attribut de l'objet sous lequel la recherche est effectuée. Par défaut sur props.label sinon sur l'élément lui-même s'il n'est pas un objet
 * @param {*} searchBarOnChange (function) Ecoute le changement dans la barre de recherche
 * @param {*} searchBarPlaceholder (string) Placeholder de la barre de recherche
 */
export const ListDol = (props) => {
  const [list, setList] = useState(props.list);
  const [groups, setGroups] = useState({});

  useEffect(() => {
    let groups = {};
    props.list.map((element) => {
      const groupLabel = props.listGroupDate
        ? timestampToDate(element[props.listGroup])
        : element[props.listGroup];
      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }
      groups[groupLabel].push(element);
    });
    setGroups(groups);
  }, [props.listGroup]);

  const handleSearchBarOnChange = (value) => {
    if (groups) {
      let groups = {};

      props.list.map((element) => {
        let searchOnFilter = searchBarFilter(element, value);
        if (props.searchOn) {
          searchOnFilter = searchBarFilter(element[props.searchOn], value);
        } else if (props.label) {
          searchOnFilter = searchBarFilter(element[props.label], value);
        }
        if (searchOnFilter) {
          const groupLabel = props.listGroupDate
            ? timestampToDate(element[props.listGroup])
            : element[props.listGroup];
          if (!groups[groupLabel]) {
            groups[groupLabel] = [];
          }
          groups[groupLabel].push(element);
        }
      });
      setGroups(groups);
    } else {
      setList(
        props.list.filter((element) => {
          if (props.searchOn) {
            return searchBarFilter(element[props.searchOn], value);
          } else if (props.label) {
            return searchBarFilter(element[props.label], value);
          }
          return searchBarFilter(element, value);
        })
      );
    }
  };

  return (
    <>
      {(props.searchBarOnChange ||
        props.searchOn ||
        props.searchBarPlaceholder) && (
        <SearchBarDol
          onChange={(e) => handleSearchBarOnChange(e.target.value)}
          placeholder={props.searchBarPlaceholder}
        />
      )}
      {props.listGroup ? (
        <List strong dividers={false}>
          {Object.values(groups).length > 0 &&
            Object.values(groups).map((group, groupIndex) => (
              <ListGroup dividers={false} key={groupIndex}>
                <ListItem
                  title={Object.keys(groups)[groupIndex]}
                  groupTitle
                  className="ios:top-0-safe material:top-16-safe sticky text-xl py-6"
                />
                {group.length > 0 &&
                  group.map((element, elementIndex) =>
                    props.to || props.state ? (
                      <Link
                        to={props.to || "/"}
                        state={props.state ? element : null}
                        key={elementIndex}
                      >
                        <ListItem
                          title={
                            <div className="row-v-center gap-3">
                              <span className="text-xl">
                                {props.label ? element[props.label] : element}
                              </span>
                              {props.status || ""}
                            </div>
                          }
                          href
                        />
                      </Link>
                    ) : (
                      <ListItem
                        title={
                          <div className="row-v-center gap-3">
                            <span className="text-xl">
                              {props.label ? element[props.label] : element}
                            </span>
                            {props.status || ""}
                          </div>
                        }
                      />
                    )
                  )}
              </ListGroup>
            ))}
        </List>
      ) : (
        <List strong dividers={false}>
          {list.length > 0 &&
            list.map((element, elementIndex) =>
              props.to || props.state ? (
                <Link
                  to={props.to || "/"}
                  state={props.state ? element : null}
                  key={elementIndex}
                >
                  <ListItem
                    title={
                      <div className="row-v-center gap-3">
                        <span className="text-xl">
                          {props.label ? element[props.label] : element}
                        </span>
                        {props.status || ""}
                      </div>
                    }
                    href
                  />
                </Link>
              ) : (
                <ListItem
                  title={
                    <div className="row-v-center gap-3">
                      <span className="text-xl">
                        {props.label ? element[props.label] : element}
                      </span>
                      {props.status || ""}
                    </div>
                  }
                />
              )
            )}
        </List>
      )}
    </>
  );
};