// /*
// BOOTSTRAP: https://startbootstrap.com/theme/clean-blog
// */

import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import alert from "alert";
import cookieParser from "cookie-parser";
import * as paypal from "./paypal-api.js";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import bcrypt from "bcrypt";
import multer from "multer";

const PORT = process.env.PORT;

const app = express();
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

import winston from "winston";
import "winston-daily-rotate-file";
import "winston-mongodb";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "MongoDB" },
  transports: [
    new winston.transports.DailyRotateFile({
      filename: "application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
    }),
    new winston.transports.MongoDB({
      db: process.env.DATABASE_LINK,
      collection: "logs",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;

let page = "Login";
let adminLog = false;
let adminCookie;

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

const url = process.env.DATABASE_LINK;

const clientSchema = mongoose.model(
  "client",
  new mongoose.Schema(
    {
      id: String,
      nom: String,
      prenom: String,
      courriel: String,
      password: String,
      adresse: String,
      telephone: String,
    },
    { collection: "client" }
  )
);

const vetement = mongoose.model(
  "vetement",
  new mongoose.Schema(
    {
      vetement_id: String,
      nom_vetement: String,
      type_vetement: String,
      prix: Number,
      quantite: Number,
      marque_vetement: String,
      taille_vetement: String,
      description: String,
      image: String,
    },
    { collection: "vetement" }
  )
);

const reviews = mongoose.model(
  "reviews",
  new mongoose.Schema(
    {
      id_commentaire: String,
      vetement_id: String,
      client_id: String,
      nom: String,
      prenom: String,
      commentaire: String,
      date_creation: Date,
    },
    { collection: "reviews" }
  )
);

const ItemCommSchema = mongoose.model(
  "item_comm",
  new mongoose.Schema(
    {
      vetement_id: Number,
      nom_vetement: String,
      type_vetement: String,
      prix: Number,
      quantite: Number,
      marque_vetement: String,
      taille_vetement: String,
      description: String,
      image: String,
    },
    { collection: "item_comm" }
  )
);

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Connexion réussite à MongoDB!");
  })
  .catch((err) => {
    logger.info("Erreur de connexion.");
    logger.info(err);
  });

app.get("/", function (req, res) {
  try {
    if (req.headers.cookie != undefined) {
      page = "Logout";
    }
  } catch (err) {
    console.log(err);
  }

  checkCondition(req);

  res.render("pages/accueil", { page });
});

app.get("/apropos", function (req, res) {
  const data = {
    pageTitre: "About",
    page,
  };
  checkCondition(req);
  res.render("pages/apropos", data);
});

app.get("/fbMaxime", (req, res) => {
  res.render("pages/fbMaxime");
});

app.get("/fbLotfi", (req, res) => {
  res.render("pages/fbLotfi");
});

app.get("/fbAyoub", (req, res) => {
  res.render("pages/fbAyoub");
});

app.get("/oublier-mdp", function (req, res) {
  const data = {
    pageTitre: "Forgot password",
    page,
  };
  checkCondition(req);
  res.render("pages/oubliermdp", data);
});

const hasbullahEmail = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "anatoliygregory@outlook.com",
    pass: "batman123",
  },
});

app.post("/envoyerEmail", (req, res) => {
  const hasbullahEmail = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "hasbullaTest@outlook.com",
      pass: "hasbulla123",
    },
  });

  const emailtest = {
    from: "hasbullaTest@outlook.com",
    to: "hasbullaTest@outlook.com",
    subject: "Message d'un client",
    text: req.body.message,
    //text: "voici le lien pour changer vorte mot de passe: \n \n" + link + "\n  Ce lien expirera dans 15 minutes."
  };

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(req.body.email)) {
    alert("Vous n'avez pas entrez une adresse courriel");
    res.redirect("/");
    res.end;
  }

  hasbullahEmail.sendMail(emailtest, function (err, info) {
    if (err) {
      logger.info(err);
      return;
    }
    logger.info("Email sent: " + info.response);
  });

  res.redirect("/");
});

// Nous avons utilisé ces paramètres pour générer l'adresse pour la section oublier mot de passe
const utilisateur = {
  id: "1",
  email: "yeassxd@gmail.com",
  password: "12345",
};

var email;
var email1;
var email2;
app.post("/oublier-mdp", (req, res) => {
  var { email } = req.body;
  var { email1 } = req.body;

  if (email != email1) {
    res.render("pages/MDPOublierErreur");
  } else {
    email2 = email;

    const JWT_SECRET = "le secret le plus secreter";

    //s'assurer que l'adresse email existe
    async function trouverCourriel(email) {
      try {
        const filter = { courriel: email };
        const user = await clientSchema.findOne(filter);

        if (user) {
          logger.info("Utilisateur trouver!:");
          res.render("pages/regarderEmail");

          hasbullahEmail.sendMail(emailtest, function (err, info) {
            if (err) {
              logger.info(err);
              return;
            }
            logger.info(info.response);
          });
        } else {
          logger.info("Erreur: utilisateur nexiste pas ou nest pas trouver");
          res.render("pages/MDPOublierErreur");
        }
      } catch (err) {
        logger.info("Erreur de recherche dans la collection:", err);
      } finally {
        //mongoose.connection.close();
      }
    }

    trouverCourriel(email);

    const secret = JWT_SECRET + utilisateur.password;
    const payload = {
      email: utilisateur.email,
      id: utilisateur.id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "10m" });
    const link = `http://localhost:3000/reinitialiser-mdp/${utilisateur.id}/${token}`;

    //alterner entre console.log et email car firewall ecole.

    // template email

    const html =
      `
  <h1> Hasbullah Market </h1>
  <h2> Voici le lien pour changer votre mot de passe: </h2>
  ` +
      link +
      `<br> <h3> Ce lien expirera dans 15 minutes.</h3>`;

    const emailtest = {
      from: "anatoliygregory@outlook.com",
      to: email,
      subject: "Changer votre MDP",
      html: html,

      //text: "voici le lien pour changer vorte mot de passe: \n \n" + link + "\n  Ce lien expirera dans 15 minutes."
    };

    // Fin template email
    logger.info(link);
  }
});

app.get("/reinitialiser-mdp/:id/:token", (req, res) => {
  const { id, token } = req.params;

  res.render("pages/reinitialiser-mdp", { email: utilisateur.email, page });
});

var password2;

app.post("/reinitialiser-mdp/:id/:token", (req, res) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;

  //valider que pass1 et pass2 sont la même chose
  if (password != password2) {
    res.render("pages/MDPOublierErreur");
    return;
  }

  async function changerMDP(password2, email2) {
    let cryptPassword;
    const saltRounds = 10;
    bcrypt
      .hash(password2, saltRounds)
      .then((hash) => {
        console.log("Hash ", hash);
        cryptPassword = hash;
      })
      .catch((err) => console.error(err.message));

    setTimeout(async function () {
      try {
        const filter = { courriel: email2 };
        const update = { password: cryptPassword };
        const options = { new: true };

        const updatedUser = await clientSchema.findOneAndUpdate(
          filter,
          update,
          options
        );

        if (updatedUser) {
          logger.info("Utilisateur dans la collection client a ete changer...");
          res.render("pages/mdpchanger");
        } else {
          logger.info('Utilisateur non trouver dans la collection "client"!!!');
        }
      } catch (err) {
        console.error("Erreur survenu durant le changement:", err);
      } finally {
      }
    }, 2000);
  }

  changerMDP(password2, email2);
});

var prixtotalFinal2 = 10;

app.get("/panier", async (req, res) => {
  try {
    if (req.headers.cookie == undefined) {
      await ItemCommSchema.deleteMany({});
    }

    const vetements_comm = await ItemCommSchema.find();
    let prixTotal = 0;
    vetements_comm.forEach((item) => {
      prixTotal += item.prix;
    });
    let prixTotalFinal = (prixTotal * 1.15).toFixed(2);
    prixtotalFinal2 = prixTotalFinal;

    res.render("pages/panier", {
      data: vetements_comm,
      pageTitre: "Cart",
      page,
      prixTotalFinal,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur");
  }
});

app.delete("/panier/:id", async (req, res) => {
  try {
    await ItemCommSchema.findByIdAndRemove(req.params.id);
    res.redirect("/panier");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur");
  }
});

export { prixtotalFinal2 };

app.post("/my-server/create-paypal-order", async (req, res) => {
  try {
    const order = await paypal.createOrder();
    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/my-server/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/articles", async (req, res) => {
  try {
    const vetements = await vetement.find();
    checkCondition(req);
    res.render("pages/articles", { data: vetements, pageTitre: "Items", page });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur");
  }
});

app.post("/articles/filter", async (req, res) => {
  try {
    const { searchTerm, selectedBrand, selectedSize, sortOrderValue } =
      req.body;

    let query = {};

    if (searchTerm) {
      query.$or = [
        { marque_vetement: { $regex: searchTerm, $options: "i" } },
        { nom_vetement: { $regex: searchTerm, $options: "i" } },
        { taille_vetement: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (selectedBrand && selectedBrand !== "all") {
      query.marque_vetement = selectedBrand;
    }

    if (selectedSize && selectedSize !== "all") {
      query.taille_vetement = selectedSize;
    }

    let sortQuery = {};

    if (sortOrderValue === "price-asc") {
      sortQuery.prix = 1;
    } else if (sortOrderValue === "price-desc") {
      sortQuery.prix = -1;
    }

    const articlesFiltrer = await vetement.find(query).sort(sortQuery);
    res.json(articlesFiltrer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur");
  }
});

app.get("/admin_articles", async (req, res) => {
  checkCondition(req);

  if (adminLog == true) {
    try {
      const vetements = await vetement.find();
      res.render("pages/admin_articles", {
        data: vetements,
        pageTitre: "Admin_Items",
        page,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur");
    }
  } else {
    res.status(500).send("Erreur");
  }
});

app.delete("/admin_articles/:id", async (req, res) => {
  if (adminLog == true) {
    try {
      await vetement.findByIdAndRemove(req.params.id);
      res.redirect("/admin_articles");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur");
    }
  } else {
    res.status(500).send("Erreur");
  }
});

app.get("/articles/:vetement_id", async (req, res) => {
  try {
    const vetement_id = req.params.vetement_id;

    const vetementSelectionnee = await vetement.findOne({ vetement_id });

    const reviewsSelectionnees = await reviews.find({ vetement_id });

    const titre =
      vetementSelectionnee.marque_vetement +
      " - " +
      vetementSelectionnee.nom_vetement;

    const clientId = req.cookies.client_id || "CLIENT_ID";

    const data = {
      pageTitre: titre,
      item: vetementSelectionnee,
      review: reviewsSelectionnees,
      page,
      clientId,
    };
    checkCondition(req);
    res.render("pages/articleSelectionne", data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur");
  }
});

app.post("/ajouter-commentaire", async (req, res) => {
  try {
    const { vetement_id, client_id, commentaire } = req.body;

    const client = await clientSchema.findOne({ id: client_id });

    id = req.body.vetement_id;

    if (!client) {
      console.error("Client introuvable");
      alert("Vous devez vous connecter");
      res.redirect(`/articles/${id}`);
      return;
    }

    const newReview = new reviews({
      id_commentaire: Date.now().toString(),
      vetement_id,
      client_id,
      nom: client.nom,
      prenom: client.prenom,
      commentaire,
      date_creation: new Date(),
    });

    await newReview.save();

    res.redirect(`/articles/${vetement_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'ajout du commentaire");
  }
});

app.get("/connexion", function (req, res) {
  try {
    if (req.headers.cookie != undefined) {
      res.clearCookie("session");
      res.clearCookie("client_id");
      adminCookie = null;
      page = "Login";
      res.redirect("/");
    } else {
      res.render("pages/connexion");
    }
  } catch (err) {
    logger.info(err);
  }
});

app.get("/inscription", function (req, res) {
  try {
    if (req.headers.cookie != undefined) {
    } else {
      page = "Login";
    }
  } catch (err) {
    logger.info(err);
  }
  checkCondition(req);
  res.render("pages/inscription", { page });
});

app.post("/connecter-utilisateur", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(email)) {
    alert("Vous n'avez pas entrez une adresse courriel");
    res.redirect("/inscription");
    res.end;
  }

  clientSchema.findOne({ courriel: email }).then((user) => {
    let validate;
    if (user) {
      bcrypt
        .compare(password, user.password)
        .then((res) => {
          validate = res;
        })
        .catch((err) => console.error(err.message));
    }

    setTimeout(function () {
      console.log(validate);
      if (user && validate) {
        logger.info("Bienvenue, vous etes connecté");

        res.setHeader(
          "Set-Cookie",
          `client_id=${user.id}; Max-Age=3600; HttpOnly, Secure`
        );

        if (user.email == "admin@gmail.com") {
          adminCookie = res.cookie.value.client_id;
        }

        res.redirect("/");
      } else {
        logger.info(
          "Le courriel ou le mot de passe que vous avez entrez est invalide"
        );
        alert(
          "Le courriel ou le mot de passe que vous avez entrez est invalide"
        );
        res.end;
      }
    }, 2000);
  });
});

app.post("/creer-utilisateur", function (req, res) {
  let value = Math.random() * (9999999 - 1000000 + 1) + 1000000;
  value = Math.round(value);
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  let id = nom.slice(0, 3) + prenom.slice(0, 1) + value;
  const email = req.body.email;
  if (email == "admin@gmail.com") {
    id = 1000000;
  }
  const password = req.body.password;
  let cryptPassword;
  const saltRounds = 10;
  bcrypt
    .hash(password, saltRounds)
    .then((hash) => {
      console.log("Hash ", hash);
      cryptPassword = hash;
    })
    .catch((err) => console.error(err.message));

  const adresse = req.body.adressee;
  const telephone = req.body.telephone;
  let password2 = req.body.password2;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const patternPhone = /^\d{10}$/;

  if (password != password2) {
    alert("Les mots de passe ne sont pas identiques");
    logger.info(password + " " + password2);
    res.redirect("/inscription");
    res.end;
  } else if (!pattern.test(email)) {
    alert("Vous n'avez pas entrez une adresse courriel");
    res.redirect("/inscription");
    res.end;
  } else if (!patternPhone.test(telephone)) {
    alert("Vous n'avez pas entrez un numero de telephone valide");
  } else {
    setTimeout(function () {
      clientSchema
        .findOne({ courriel: email })
        .then((user) => {
          if (user) {
            logger.info("Utilisateur existe:", user);
            alert(
              "Le courriel que vous avez entrez est deja relié a un compte"
            );
            res.redirect("/inscription");
          } else {
            const newUser = new clientSchema({
              id: id,
              nom: nom,
              prenom: prenom,
              courriel: email,
              password: cryptPassword,
              adresse: adresse,
              telephone: telephone,
            });

            const newVetement = new vetement({
              vetement_id: String,
              nom_vetement: String,
              type_vetement: String,
              prix: Number,
              quantite: Number,
              marque_vetement: String,
              taille_vetement: String,
              description: String,
              image: String,
            });

            newUser
              .save()
              .then(() => console.log("Utilisateur creer:", newUser))
              .catch((error) => console.log(error));

            res.redirect("/connexion");
          }
        })
        .catch((error) => console.log(error));
    }, 2000);
  }
});

var id;
var description;
var imagez;
var marque;
var nom;
var taille;
var prix;

app.post("/ajouterPanier", function (req, res) {
  id = req.body.vetement_id;
  description = req.body.item_description;
  imagez = req.body.item_image;
  marque = req.body.item_marque;
  nom = req.body.item_nom;
  taille = req.body.item_taille;
  prix = req.body.item_prix;

  console.log(req.headers.cookie);

  try {
    if (req.headers.cookie != undefined) {
      logger.info(id);
      logger.info(imagez);
      logger.info(marque);
      logger.info(nom);
      logger.info(taille);
      logger.info(prix);
      main();
      res.redirect("/panier");
    } else {
      alert("Vous devez vous connecter");
      res.redirect(`/articles/${id}`);
    }
  } catch (err) {
    logger.info(err);
  }
});

async function main() {
  let userSchema;

  if (mongoose.models.item_comm) {
    userSchema = mongoose.model("item_comm");
  } else {
    userSchema = mongoose.model(
      "item_comm",
      new mongoose.Schema(
        {
          vetement_id: Number,
          nom_vetement: String,
          type_vetement: String,
          prix: Number,
          quantite: Number,
          marque_vetement: String,
          taille_vetement: String,
          description: String,
          image: String,
        },
        { collection: "item_comm" }
      )
    );
  }

  const newUser = {
    vetement_id: id,
    nom_vetement: nom,
    prix: prix,
    marque_vetement: marque,
    taille_vetement: taille,
    description: description,
    image: imagez,
  };

  const userInstance = new userSchema(newUser);
  // ajouter DATA dans la collection voulu
  try {
    const savedUser = await userInstance.save();
    logger.info("Un vetement a ete ajouter..");
  } catch (err) {
    console.error("Erreur ajout vetement:", err);
  } finally {
  }
}

app.get("/ajouterArticle", async (req, res) => {
  checkCondition(req);
  if (adminLog == true) {
    try {
      const vetements = await vetement.find();
      res.render("pages/ajouterArticle", {
        data: vetements,
        pageTitre: "Items",
        page,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur");
    }
  } else {
    res.status(500).send("Erreur");
  }
});

const upload = multer({ storage: storage });

app.post("/ajoutVetement", upload.single("image"), async (req, res) => {
  let id = Math.random() * (999999 - 100000 + 1) + 100000;
  id = Math.round(id);
  const nom = req.body.name;
  const type = req.body.type;
  const taille = req.body.taille;
  const prix = req.body.price;
  const quantite = req.body.Quantite;
  const marque = req.body.marque;
  const description = req.body.Description;
  const uploadedImage = req.file;

  if (!uploadedImage) {
    return res.status(400).json({ error: "No image provided." });
  } else {
    vetement.findOne({ nom_vetement: nom }).then((user) => {
      if (!user || user.taille_vetement != taille) {
        const newVetement = new vetement({
          vetement_id: id,
          nom_vetement: nom,
          type_vetement: type,
          prix: prix,
          quantite: quantite,
          marque_vetement: marque,
          taille_vetement: taille,
          description: description,
          image: "/images/" + uploadedImage.originalname,
        });

        newVetement
          .save()
          .then(() => logger.info("Article creer:", newVetement))
          .catch((error) => console.log(error));
        res.redirect("/admin_articles");
      } else {
        logger.info("L'article que vous essayer d'ajouter existe deja");
        alert("L'article que vous essayer d'ajouter existe deja");
        res.end;
      }
    });
  }
});

function checkCondition(req) {
  const CookieValue = req.cookies.client_id;

  if (CookieValue == 1000000) {
    adminLog = true;
  } else {
    adminLog = false;
  }
  // console.log(adminLog);
}

app.get("/getVariableValue", (req, res) => {
  let variableValue = adminLog;

  res.json({ variableName: variableValue });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Lien: http://localhost:${PORT}`);
});
