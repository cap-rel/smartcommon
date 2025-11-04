// Revenir par default
// Montrer le code et le copier
// Choisir les props
// Choisir les variantes
// styliser (style, className) avec les paramètres

// import { useEffect, useState } from "react";

// export default function ScrollListener() {
//   const [scrollDirection, setScrollDirection] = useState(null);

//   useEffect(() => {
//     let lastScrollY = window.scrollY;

//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;
//       if (currentScrollY > lastScrollY) {
//         setScrollDirection("down");
//       } else if (currentScrollY < lastScrollY) {
//         setScrollDirection("up");
//       }
//       lastScrollY = currentScrollY;
//     };

//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   return (
//     <div className="h-[200vh] flex flex-col items-center justify-center">
//       <p className="text-2xl font-bold">
//         Scroll vers le {scrollDirection ? scrollDirection : "attente..."}
//       </p>
//     </div>
//   );
// }