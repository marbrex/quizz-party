/* globals renderQuizzes renderUserBtn */

// //////////////////////////////////////////////////////////////////////////////
// LE MODELE, a.k.a, ETAT GLOBAL
// //////////////////////////////////////////////////////////////////////////////

// un objet global pour encapsuler l'état de l'application
// on pourrait le stocker dans le LocalStorage par exemple
var state = {
  // la clef de l'utilisateur
  xApiKey: '',

  // l'URL du serveur où accéder aux données
  serverUrl: 'https://lifap5.univ-lyon1.fr',

  // la liste des quizzes
  quizzes: [],

  // le quizz actuellement choisi
  currentQuizz: undefined,
};

// une méthode pour l'objet 'state' qui va générer les headers pour les appel à fetch
const headers = new Headers();
headers.set('X-API-KEY', state.xApiKey);
headers.set('Accept', 'application/json');
headers.set('Content-Type', 'application/json');
state.headers = headers;

// //////////////////////////////////////////////////////////////////////////////
// OUTILS génériques
// //////////////////////////////////////////////////////////////////////////////

// un filtre simple pour récupérer les réponses HTTP qui correspondent à des
// erreurs client (4xx) ou serveur (5xx)
// eslint-disable-next-line no-unused-vars
function filterHttpResponse(response) {
  return response
    .json()
    .then((data) => {
      if (response.status >= 400 && response.status < 600) {
        throw new Error(`${data.name}: ${data.message}`);
      }
      return data;
    })
    .catch((err) => console.error(`Error on json: ${err}`));
}

// Le bouton "Login" est appue
document.getElementById('login-submit').onclick = () => {
  state.xApiKey = document.getElementById('login-key-input').value;
  document.getElementById('login-key-input').value = '';
  // console.log(state.xApiKey);

  headers.set('X-API-KEY', state.xApiKey);

  const url = `${state.serverUrl}/users/whoami`;
  fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      state.user = data;

      modifyWelcomeModalHtml();
      signedIn();
    });
};

// Le bouton "Logout" est appue
document.getElementById('logout-submit').onclick = () => {
  state.xApiKey = '';
  console.log(`state.xApiKey = '${state.xApiKey}'`);

  state.user = undefined;
  console.log(`state.user = ${state.user}`);

  logedOut();
};

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES UTILISATEURS
// //////////////////////////////////////////////////////////////////////////////

// mise-à-jour asynchrone de l'état avec les informations de l'utilisateur
// l'utilisateur est identifié via sa clef X-API-KEY lue dans l'état
// eslint-disable-next-line no-unused-vars
const getUser = () => {
  console.debug(`@getUser()`);
  const url = `${state.serverUrl}/users/whoami`;
  return fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      // /!\ ICI L'ETAT EST MODIFIE /!\
      state.user = data;
      // on lance le rendu du bouton de login
      return renderUserBtn();
    });
};

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES QUIZZES
// //////////////////////////////////////////////////////////////////////////////

// mise-à-jour asynchrone de l'état avec les informations de l'utilisateur
// getQuizzes télécharge la page 'p' des quizzes et la met dans l'état
// puis relance le rendu
// eslint-disable-next-line no-unused-vars
const getQuizzes = (p = 1) => {
  console.debug(`@getQuizzes(${p})`);
  const url = `${state.serverUrl}/quizzes/?page=${p}`;

  // le téléchargement est asynchrone, là màj de l'état et le rendu se fait dans le '.then'
  return fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      // /!\ ICI L'ETAT EST MODIFIE /!\
      state.quizzes = data;

      // on a mis à jour les donnés, on peut relancer le rendu
      // eslint-disable-next-line no-use-before-define
      return renderQuizzes();
    });
};

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES QUESTIONS
// //////////////////////////////////////////////////////////////////////////////

const getQuestions = (quizId) => {
  console.debug(`@getQuestions(${quizId})`);
  const url = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions/`;

  return fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      state.questions = data;

      // console.log(state.questions);
      return renderCurrentQuizz();
    });
};

// //////////////////////////////////////////////////////////////////////////////
// PROPOSITIONS
// //////////////////////////////////////////////////////////////////////////////

// Bouton "Terminer" est clickable ssi
// l'utilisateur a repondu a toutes les questions
function onClickProp() {
  setTimeout(() => {
    let nb = 0;

    state.questions.map((qstn) => {
      nb += document.querySelectorAll(`input[type=radio]:checked.input-qstn-${qstn.question_id}`).length;
    });
    console.log("nb : " + nb);

    if (nb === state.questions.length) {
      document.getElementById('quiz-done-btn').classList.remove("disabled");
    }
  }, 100);
}

function showHideProps(qstn_id) {
  document.querySelector(`#qstn-${qstn_id}-props`).classList.toggle('propositions-block-show');
  document.querySelector(`#qstn-${qstn_id}-props`).classList.toggle('propositions-block-collapsed');
}

const postAnswers = (quiz_id, qstn_id, prop_id) => {
  console.debug(`@postProps(${quiz_id}, ${qstn_id}, ${prop_id})`);
  const url = `${state.serverUrl}/quizzes/${quiz_id}/questions/${qstn_id}/answers/${prop_id}`;

  let configObj = {
    method: 'POST',
    headers: state.headers
  };

  return fetch(url, configObj)
  .then(filterHttpResponse)
  .then((data) => {
    console.log("postProps response : ");
    console.log(data);
    return data;
  });
};

function onClickTerminer() {
  console.log("Questions : ");
  console.log(state.questions);
  state.questions.map((qstn) => {
    console.log("Propositions : ");
    console.log(qstn.propositions);
  });

  let propsArr = new Array;

  console.log("user : ");
  console.log(state.user);

  state.questions.map((qstn, index) => {
    propsArr[index] = Number(document.querySelector(`input[type=radio]:checked.input-qstn-${qstn.question_id}`).value);

    let jsonData = new Object({
      user_id: state.user.user_id,
      quiz_id: qstn.quiz_id,
      question_id: qstn.question_id,
      proposition_id: propsArr[index],
      answered_at: new Date()
    });

    console.log("jsonData : ");
    console.log(jsonData);

    let response = postAnswers(jsonData.quiz_id, jsonData.question_id, jsonData.proposition_id);
  });
}