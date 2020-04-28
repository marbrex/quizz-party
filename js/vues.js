/* global state getQuizzes */

// //////////////////////////////////////////////////////////////////////////////
// HTML : fonctions génération de HTML à partir des données passées en paramètre
// //////////////////////////////////////////////////////////////////////////////

const modifyWelcomeModalHtml = () => {
  var welcomeModal = document.getElementById('modal-welcome');
  welcomeModal.children[0].innerHTML = `
      <h4>Welcome, ${state.user.lastname} ${state.user.firstname} !</h4>
      <p>We are glad to see you !</p>
    `;
};

const signedIn = () => {
  var profileIcon = document.getElementById('id-login');
  profileIcon.style.display = 'inline-block';

  var loginBtnBlock = document.getElementById('login-btn').parentNode;
  loginBtnBlock.innerHTML = `
                  <a id="logout-btn" class="waves-effect waves-light btn modal-trigger" href="#modal-logout">Logout</a>
                `;
};

const logedOut = () => {
  var profileIcon = document.getElementById('id-login');
  profileIcon.style.display = 'none';

  var logoutBtnBlock = document.getElementById('logout-btn').parentNode;
  logoutBtnBlock.innerHTML = `
                  <a id="login-btn" class="waves-effect waves-light btn modal-trigger" href="#modal-login">Login</a>
                `;
};

// génération d'une liste de quizzes avec deux boutons en bas
const htmlQuizzesList = (quizzes, curr, total) => {
  console.debug(`@htmlQuizzesList(.., ${curr}, ${total})`);

  // un élement <li></li> pour chaque quizz. Noter qu'on fixe une donnée
  // data-quizzid qui sera accessible en JS via element.dataset.quizzid.
  // On définit aussi .modal-trigger et data-target="id-modal-quizz-menu"
  // pour qu'une fenêtre modale soit affichée quand on clique dessus
  // VOIR https://materializecss.com/modals.html
  const quizzesLIst = quizzes.map(
    (q) =>
      `<li class="collection-item cyan lighten-5 quizz-element" data-quizzid="${q.quiz_id}">
        <h5>${q.title}</h5>
        ${q.description} <a class="chip">${q.owner_id}</a>
      </li>`
  );

  // le bouton "<" pour revenir à la page précédente, ou rien si c'est la première page
  // on fixe une donnée data-page pour savoir où aller via JS via element.dataset.page
  const prevBtn =
    curr !== 1
      ? `<button id="id-prev-quizzes" data-page="${curr -
          1}" class="btn"><i class="material-icons">navigate_before</i></button>`
      : '';

  // le bouton ">" pour aller à la page suivante, ou rien si c'est la première page
  const nextBtn =
    curr !== total
      ? `<button id="id-next-quizzes" data-page="${curr +
          1}" class="btn"><i class="material-icons">navigate_next</i></button>`
      : '';

  // La liste complète et les deux boutons en bas
  const html = `
  <ul class="collection">
    ${quizzesLIst.join('')}
  </ul>
  <div class="row">      
    <div class="col s6 left-align">${prevBtn}</div>
    <div class="col s6 right-align">${nextBtn}</div>
  </div>
  `;
  return html;
};

// //////////////////////////////////////////////////////////////////////////////
// RENDUS : mise en place du HTML dans le DOM et association des événemets
// //////////////////////////////////////////////////////////////////////////////

// met la liste HTML dans le DOM et associe les handlers aux événements
// eslint-disable-next-line no-unused-vars
function renderQuizzes() {
  console.debug(`@renderQuizzes()`);

  // les éléments à mettre à jour : le conteneur pour la liste des quizz
  const usersElt = document.getElementById('id-all-quizzes-list');
  // une fenêtre modale définie dans le HTML
  const modal = document.getElementById('id-modal-quizz-menu');

  // on appelle la fonction de généraion et on met le HTML produit dans le DOM
  usersElt.innerHTML = htmlQuizzesList(
    state.quizzes.results,
    state.quizzes.currentPage,
    state.quizzes.nbPages
  );

  // /!\ il faut que l'affectation usersElt.innerHTML = ... ait eu lieu pour
  // /!\ que prevBtn, nextBtn et quizzes en soient pas null
  // les éléments à mettre à jour : les boutons
  const prevBtn = document.getElementById('id-prev-quizzes');
  const nextBtn = document.getElementById('id-next-quizzes');
  // la liste de tous les quizzes individuels
  const quizzes = document.querySelectorAll('#id-all-quizzes-list li');

  // les handlers quand on clique sur "<" ou ">"
  function clickBtnPager() {
    // remet à jour les données de state en demandant la page
    // identifiée dans l'attribut data-page
    // noter ici le 'this' QUI FAIT AUTOMATIQUEMENT REFERENCE
    // A L'ELEMENT AUQUEL ON ATTACHE CE HANDLER
    getQuizzes(this.dataset.page);
  }
  if (prevBtn) prevBtn.onclick = clickBtnPager;
  if (nextBtn) nextBtn.onclick = clickBtnPager;

  // qd on clique sur un quizz, on change sont contenu avant affichage
  // l'affichage sera automatiquement déclenché par materializecss car on
  // a définit .modal-trigger et data-target="id-modal-quizz-menu" dans le HTML
  function clickQuiz() {
    const quizzId = this.dataset.quizzid;
    console.debug(`@clickQuiz(${quizzId})`);
    const addr = `${state.serverUrl}/quizzes/${quizzId}`;
    const html = `
      <p>Vous pourriez aller voir <a href="${addr}">${addr}</a>
      ou <a href="${addr}/questions">${addr}/questions</a> pour ses questions<p>.`;
    modal.children[0].innerHTML = html;
    state.currentQuizz = quizzId;
    // eslint-disable-next-line no-use-before-define
    getQuestions(state.currentQuizz);
  }

  // pour chaque quizz, on lui associe son handler
  quizzes.forEach((q) => {
    q.onclick = clickQuiz;
  });
}

function renderMyQuizzes() {
  const listHtml = document.getElementById('id-my-quizzes-list');

  let html = `<ul class="collection">`;
  state.myQuizzes.map(
    (q) =>
      html += `<li class="collection-item cyan lighten-5 quizz-element" data-quizzid="${q.quiz_id}">
        <h5>${q.title}</h5>
        ${q.description} <a class="chip">${q.owner_id}</a>
      </li>`
  );
  html += `</ul>`;

  listHtml.innerHTML = html;
}

function renderMyAnswers() {
  const listHtml = document.getElementById('id-my-answers-list');

  let html = `<ul class="collection">`;
  state.myAnswers.map((answ) => {
    console.log('This is a quizz, to which i have answered : ');
    console.log(answ.quiz_id);

    html += `<li class="collection-item cyan lighten-5 quizz-element">
      <h5>${answ.title}</h5>
      ${answ.description} <a class="chip">Author : ${answ.owner_id}</a>
      <a class="chip">Quizz ID : ${answ.quiz_id}</a>
    </li>`;
  });
  html += `</ul>`;

  listHtml.innerHTML = html;
}

function renderCurrentQuizz() {
  const main = document.getElementById('id-all-quizzes-main');

  // let html = `<ul class="collection">`;
  // // console.log(state.quizzes);
  // var quizzesArr = state.quizzes.results;
  // console.log(quizzesArr);
  // var myQuiz = quizzesArr.find(o => o.quiz_id == state.currentQuizz);
  // // console.log(myQuiz);
  // Object.keys(myQuiz).map(function(objectKey, index) {
  //   var value = myQuiz[objectKey];
  //   html += `<li class="collection-item cyan lighten-5">
  //     ${objectKey} = ${value}
  //   </li>`;
  // });
  // html += `</ul>`;
  // main.innerHTML = html;
  let html;
  let questionsArr = state.questions;

  if (questionsArr.length === 0) {
    html = `<h4 class="center-align"><i class="material-icons">sentiment_dissatisfied</i>This quizz doesn't have any questions !</h4>`;
  }
  else {
    html = `<ul class="collection">`;
    questionsArr.map((qstn) => {
      html += `<li class="collection-item cyan lighten-5 quiz-question">
        <p>Question ${qstn.question_id+1} :</p>
        <p>
          ${qstn.sentence}
          <i id="question-drop-down-btn-${qstn.question_id}" class="material-icons question-drop-down-btn" onclick="showHideProps(${qstn.question_id})">arrow_drop_down</i>
        </p>
        <ul id="qstn-${qstn.question_id}-props" class="collection propositions-block-show">`;
      let propositionsArr = qstn.propositions;
      propositionsArr.map((prop) => {
        html += `<li class="collection-item cyan lighten-4 question-proposition">
          <p>
            <label class="qstn-prop">
              <input name="group-${qstn.question_id}" type="radio" class="input-qstn-${qstn.question_id}" id="input-qstn-${qstn.question_id}-prop-${prop.proposition_id}" value="${prop.proposition_id}" />
              <span id="qstn-${qstn.question_id}-prop-${prop.proposition_id}" class="prop" onclick="onClickProp()">${prop.content}</span>
            </label>
          </p>
        </li>`;
      });
      html += `</ul>`;
    });
    html += `</ul>
    <a id="quiz-done-btn" class="waves-effect waves-light btn disabled" onclick="onClickTerminer()"><i class="material-icons right">done</i>Terminer</a>`;
  }
  main.innerHTML = html;

  // let html = `<ul class="collapsible expandable">`;
  // let questionsArr = state.questions;
  // questionsArr.map((qstn) => {
  //   html += `<li class="active">
  //     <div class="collapsible-header">
  //       <p>Question ${qstn.question_id+1} : </p>
  //       <p>
  //         ${qstn.sentence}
  //       </p>
  //     </div>
  //     <div class="collapsible-body">
  //       <ul class="collection">`;
  //   let propositionsArr = qstn.propositions;
  //   propositionsArr.map((prop) => {
  //     html += `<li class="collection-item cyan lighten-4 question-proposition">
  //       <p>
  //         <label class="qstn-prop">
  //           <input name="group-${qstn.question_id}" type="radio" class="input-qstn-${qstn.question_id}" id="input-qstn-${qstn.question_id}-prop-${prop.proposition_id}" value="${prop.proposition_id}" />
  //           <span id="qstn-${qstn.question_id}-prop-${prop.proposition_id}" class="prop" onclick="onClickProp()">${prop.content}</span>
  //         </label>
  //       </p>
  //     </li>`;
  //   });
  //   html += `</ul></div></li>`;
  // });
  // html += `</ul>
  // <a id="quiz-done-btn" class="waves-effect waves-light btn disabled"><i class="material-icons right">done</i>Terminer</a>`;
  // main.innerHTML = html;
}

// quand on clique sur le bouton de login, il nous dit qui on est
// eslint-disable-next-line no-unused-vars
const renderUserBtn = () => {
  const btn = document.getElementById('id-login');
  btn.onclick = () => {
    if (state.user) {
      // eslint-disable-next-line no-alert
      alert(
        `Bonjour ${state.user.firstname} ${state.user.lastname.toUpperCase()}`
      );
    } else {
      // eslint-disable-next-line no-alert
      alert(
        `Please Log In by entering your XApiKey !`
      );
    }
  };
};