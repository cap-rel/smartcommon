const config = {
    generic_message: "Message générique",
    lastudate: 3838388383,
    home: [
        {
            slug: "prospection-client",
            title: "Prospection client",
            subtitle: "Pour noter des infos pendant la tournée commerciale",
            reactIcon: { library: "fa6", icon: "FaHandshake" },
            color: "#96e0db",
            badge: "12",
            attributes: [
                {
                    "name": "label",
                    "type": "varchar", // 255
                    "required" : true,
                    "label": "Titre"
                },
                {
                    "name": "description",
                    "type": "text",
                    "label": "Description"
                },
                {
                    "name": "point",
                    "type": "varchar",
                    "label": "Position"
                },
                {
                    "name": "potentiel_affaires",
                    "type": "varchar",
                    "label": "Affaires potentielles"
                },
                {
                    "name": "activity_domain",
                    "type": "varchar",
                    "label": "Secteur d'activité"
                }
            ],
        },
        {
            slug: "visite-d-entretien",
            title: "Visite d'entretien",
            subtitle: "Notes préalables pour faire les devis",
            reactIcon: { library: "fa", icon: "FaUserTie" },
            color: "#fea04a",
            badge: "3",
            attributes: [
                {
                    "name": "label",
                    "type": "varchar", // 255
                    "required": true,
                    "label": "Titre"
                },
                {
                    "name": "description",
                    "type": "text",
                    "label": "Description"
                },
                {
                    "name": "point",
                    "type": "varchar",
                    "label": "Position"
                },
                {
                    "name": "etatvetust",
                    "type": "select",
                    "options": ["Bon état", "Mauvaise état", "Très mauvaise état"],
                    "label": "Etat vetusté"
                },
                {
                    "name": "assurance",
                    "type": "varchar",
                    "label": "Assurance"
                },
                {
                    "name": "syndic",
                    "type": "boolean",
                    "label": "Syndicat"
                }
            ],
        },
    {
            slug: "etat-des-lieux",
            title: "Etat des lieux",
            subtitle: "Pour prendre des photos avant location",
            reactIcon: { library: "fa6", icon: "FaBuilding" },
            color: "#5a4be2",
            badge: "0",
            attributes: [
                {
                    "name": "label",
                    "type": "varchar", // 255
                    "required": true,
                    "label": "Titre"
                },
                {
                    "name": "description",
                    "type": "text",
                    "label": "Description"
                },
                {
                    "name": "point",
                    "type": "varchar",
                    "label": "Position"
                }
            ],
        },
        {
            slug: "test-produit",
            title: "Test produit",
            subtitle: "Pour tester les nouveaux produits de la société",
            reactIcon: { library: "fa6", icon: "FaPlugCircleCheck" },
            color: "#e52801",
            badge: "340",
            attributes: [
                {
                    "name": "label",
                    "type": "varchar", // 255
                    "label": "Titre"
                },
                {
                    "name": "description",
                    "type": "text",
                    "label": "Description"
                },
                {
                    "name": "point",
                    "type": "varchar",
                    "label": "Position"
                }
            ],
        }
    ]
}

export default config
