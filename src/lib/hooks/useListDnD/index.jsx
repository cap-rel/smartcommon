export const useListDnD = (set) => {
    const onDragStart = (e, indexLabel, parent) => {
        set(indexLabel, Number(e.currentTarget.dataset.index))
        
        // const dragPreview = e.currentTarget.closest(parent);
        // const clone = dragPreview.cloneNode(true);
        // clone.style.position = "absolute";
        // clone.style.top = "-9999px";
        // clone.style.left = "-9999px";
        // document.body.appendChild(clone);
    
        // // e.dataTransfer.setDragImage(clone, 0, 0);
        // // e.dataTransfer.setDragImage(clone, e.clientX - dragPreview.getBoundingClientRect().left, e.clientY - dragPreview.getBoundingClientRect().top);

        // clone.style.width = `${dragPreview.offsetWidth}px`;
        // clone.style.height = `${dragPreview.offsetHeight}px`;

        // // Définit l'image de drag au coin supérieur gauche du curseur
        // e.dataTransfer.setDragImage(
        //     clone,
        //     e.clientX - dragPreview.getBoundingClientRect().left,
        //     e.clientY - dragPreview.getBoundingClientRect().top
        // );
    
        // // Nettoyage après drag
        // e.dataTransfer.ondragend = () => document.body.removeChild(clone);
    };
    const onDrop = (indexLabel) => set(indexLabel, null);

    const onDragOver = (e, indexLabel, index, listLabel, list) => {
      e.preventDefault();
      const targetIndex = Number(e.currentTarget.dataset.index);
      if (targetIndex !== index) {
        const isArray = Array.isArray(list);
        const updatedList = isArray ? [...list] : Object.entries(list);
        const [movedItem] = updatedList.splice(index, 1);
        updatedList.splice(targetIndex, 0, movedItem);

        set(listLabel, isArray ? updatedList : Object.fromEntries(updatedList));
        set(indexLabel, targetIndex);
      }
    };

    return { onDragStart, onDragOver, onDrop };
};