// =========================
// REZEPT-DATENBANK
// =========================

export const recipes = {

  bolognese: {
    name: "Pasta Bolognese",
    ingredients: [
      { name: "Spaghetti", amount: 120, unit: "g" },
      { name: "Rinderhackfleisch", amount: 150, unit: "g" },
      { name: "Tomaten (gehackt)", amount: 200, unit: "g" },
      { name: "Zwiebel", amount: 0.5, unit: "Stk" },
      { name: "Karotte", amount: 0.5, unit: "Stk" },
      { name: "Sellerie", amount: 0.5, unit: "Stange" },
      { name: "Knoblauch", amount: 1, unit: "Zehe" },
      { name: "Rotwein", amount: 50, unit: "ml" },
      { name: "Olivenöl", base: true },
      { name: "Salz", base: true },
      { name: "Pfeffer", base: true },
      { name: "Parmesan", amount: 20, unit: "g" }
    ]
  },

  kartoffelbrot: {
    name: "Kartoffelbrot",
    ingredients: [
      { name: "Kartoffeln (mehlig)", amount: 250, unit: "g" },
      { name: "Weizenmehl", amount: 350, unit: "g" },
      { name: "Hefe", amount: 15, unit: "g" },
      { name: "Wasser", amount: 150, unit: "ml" },
      { name: "Kümmel", amount: 1, unit: "TL" },
      { name: "Salz", base: true },
      { name: "Butter", base: true }
    ]
  },

  zwiebelkuchen: {
    name: "Zwiebelkuchen",
    ingredients: [
      { name: "Zwiebeln", amount: 500, unit: "g" },
      { name: "Mehl", amount: 250, unit: "g" },
      { name: "Butter", amount: 100, unit: "g" },
      { name: "Ei", amount: 2, unit: "Stk" },
      { name: "Schmand", amount: 150, unit: "g" },
      { name: "Speckwürfel", amount: 100, unit: "g" },
      { name: "Hefe", amount: 10, unit: "g" },
      { name: "Milch", amount: 50, unit: "ml" },
      { name: "Kümmel", amount: 1, unit: "TL" },
      { name: "Salz", base: true },
      { name: "Pfeffer", base: true }
    ]
  },

  frikadellen: {
    name: "Frikadellen mit Kartoffelsalat",
    ingredients: [
      { name: "Hackfleisch (halb/halb)", amount: 400, unit: "g" },
      { name: "Brötchen (altbacken)", amount: 1, unit: "Stk" },
      { name: "Ei", amount: 1, unit: "Stk" },
      { name: "Zwiebel", amount: 1, unit: "Stk" },
      { name: "Senf", amount: 1, unit: "EL" },
      { name: "Kartoffeln", amount: 500, unit: "g" },
      { name: "Essiggurke", amount: 2, unit: "Stk" },
      { name: "Öl", base: true },
      { name: "Salz", base: true },
      { name: "Pfeffer", base: true },
      { name: "Paprikapulver", amount: 0.5, unit: "TL" }
    ]
  },

  carbonara: {
    name: "Pasta Carbonara",
    ingredients: [
      { name: "Spaghetti", amount: 120, unit: "g" },
      { name: "Pancetta / Bacon", amount: 80, unit: "g" },
      { name: "Eier", amount: 2, unit: "Stk" },
      { name: "Parmesan", amount: 50, unit: "g" },
      { name: "Petersilie", amount: 1, unit: "EL" },
      { name: "Olivenöl", base: true },
      { name: "Salz", base: true },
      { name: "Pfeffer", base: true }
    ]
  }

}