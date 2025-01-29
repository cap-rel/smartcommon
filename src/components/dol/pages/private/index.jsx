// import styled from "styled-components";
// import { IconDol, PrivateLayoutDol } from "../../../../dol";
// import { fontSize } from "../../../../../globals/tailwind";
// import { useEffect, useState } from "react";

// const MenuSty = styled.div`
//     grid-template-columns: ${props => `repeat(${props.itemsPerRow}, minmax(0, 1fr))`};
// `

// const ItemSty = styled.button`
//     background-color: ${props => 
//         props.item.bgColor && 
//             (props.item.aloneOnRow !== "border" && props.item.aloneOnRow !== "icon") && 
//                 props.item.bgColor
//     };
//     height: ${props => (props.item.height || props.main.itemsHeight || "128") + "px"};
//     grid-column: ${props => props.item.aloneOnRow && `span ${props.main.itemsPerRow} / span ${props.main.itemsPerRow}`};
//     border: ${props => (props.item.bgColor && (props.item.aloneOnRow === "border" || props.item.aloneOnRow === "icon")) && `2px solid ${props.item.bgColor}`};
//     border-left: none;
// `

// const IconContainerSty = styled.div`
//     background-color: ${props => (props.item.bgColor && props.item.aloneOnRow === "icon") && props.item.bgColor};
//     border-left: ${props => (props.item.bgColor && props.item.aloneOnRow === "border") && `10px solid ${props.item.bgColor}`};
//     color: ${props => (props.item.bgColor && props.item.aloneOnRow === "border") && props.item.bgColor};
// `

// const TitleSty = styled.span`
//     color: ${props => (props.item.aloneOnRow && props.item.bgColor && props.item.aloneOnRow !== "full") && props.item.bgColor};
// `

// const MenuPageDol = (props) => {
//     const config = props.config;
//     const tabbar = props.tabbar;
//     const page   = props.page;

//     const main = page.main;
//     const combinedTabbar = { ...tabbar, ...page.tabbar };

//     const Item = (props) => {
//         const item = props.item;
//         return (
//             <ItemSty
//                 main={main}
//                 item={item}
//                 className={`
//                     ${item.bgColor && "text-white"} 
//                     bg-white dark:bg-dark
//                     ${item.aloneOnRow || main.itemsPerRow == 1 ? "row-full-center" : "col-full-center gap-2"} 
//                     ${main.gap && "rounded-xl"}
//                 `}
//             >
//                 {(item.icon.library && item.icon.icon) && 
//                     <IconContainerSty 
//                         item={item}
//                         className={`
//                             ${(item.aloneOnRow || main.itemsPerRow == 1) && "h-full w-1/3"} 
//                             ${main.gap && "rounded-l-xl"}
//                             row-full-center
//                         `}
//                     >
//                         <IconDol
//                             library={item.icon.library}
//                             icon={item.icon.icon}
//                             className={`
//                                 ${fontSize[
//                                     item.icon.fontSize
//                                         ? item.icon.fontSize
//                                         : main.iconsFontSize
//                                             ? main.iconsFontSize
//                                             : item.fontSize
//                                                 ? item.fontSize + 5
//                                                 : main.iconsFontSize
//                                                     ? main.iconsFontSize
//                                                     : main.itemsFontSize
//                                                         ? main.fontSize + 5
//                                                         : 9  
//                                 ]}
//                             `}
//                         />
//                     </IconContainerSty>
//                 }
//                 <div className={`col-v-center ${(item.aloneOnRow || main.itemsPerRow == 1) && `text-left w-2/3 gap-2 p-4 h-full`}`}>
//                     {item.label &&  
//                         <TitleSty 
//                             item={item}
//                             className={`
//                                 font-semibold uppercase
//                                 ${fontSize[
//                                     item.fontSize
//                                         ? item.fontSize + 2
//                                         : main.itemsFontSize
//                                             ? main.fontSize + 2
//                                             : 4
//                                 ]}
//                             `}
//                         >
//                             {item.label}
//                         </TitleSty>
//                     }
//                     {item.description && 
//                         <span className={`
//                             italic 
//                             ${item.aloneOnRow && item.aloneOnRow !== "full" && "text-black"}
//                             ${fontSize[item.fontSize || main.itemsFontSize || 2]}`}
//                         >
//                             {item.description}
//                         </span>
//                     }
//                 </div>
//             </ItemSty>
//         );
//     }

//     const [navbarDataInPage, setNavbarDataInPage] = useState(null);
//     const [test, setTest] = useState(true);

//     useEffect(() => {
//         setTest(false)
//     }, [])

//     return (
//         <PrivateLayoutDol test={test} config={config} tabbar={tabbar} page={page} setNavbarDataInPage={setNavbarDataInPage}>
//             <MenuSty
//                 itemsPerRow={main.itemsPerRow}
//                 className={`grid place-content-stretch ${!main.gap ? "-m-4" : "gap-4"}`}
//             >
//                 {main.items.map(item => <Item item={item} />)}
//             </MenuSty>
//         </PrivateLayoutDol>
//     );
// };

// export default MenuPageDol;