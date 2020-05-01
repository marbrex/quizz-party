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
                  <a id="logout-btn" class="waves-effect waves-light btn cyan modal-trigger" href="#modal-logout">Logout</a>
                `;
};

const logedOut = () => {
  var profileIcon = document.getElementById('id-login');
  profileIcon.style.display = 'none';

  var logoutBtnBlock = document.getElementById('logout-btn').parentNode;
  logoutBtnBlock.innerHTML = `
                  <a id="login-btn" class="waves-effect waves-light btn cyan modal-trigger" href="#modal-login">Login</a>
                `;

  document.getElementById('id-my-quizzes-list').innerHTML = `<h4>Login to see your quizzes</h4>`;
  document.getElementById('id-my-answers-list').innerHTML = `<h4>Login to see your answers</h4>`;
  document.getElementById('id-my-current-quiz').innerHTML = '';
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
        <p>${q.description}</p><a class="chip">Author : ${q.owner_id}</a>
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
    
    state.quizzes.results.map((q) => {
      if (q.quiz_id != quizzId) {
        document.querySelector(`li[data-quizzid="${q.quiz_id}"]`).classList.remove("lighten-4");
        document.querySelector(`li[data-quizzid="${q.quiz_id}"]`).classList.add("lighten-5");
      }
    });
    document.querySelector(`li[data-quizzid="${quizzId}"]`).classList.toggle("lighten-5");
    document.querySelector(`li[data-quizzid="${quizzId}"]`).classList.toggle("lighten-4");

    state.currentQuizz = quizzId;
    // eslint-disable-next-line no-use-before-define
    getQuestions(state.currentQuizz);
  }

  // pour chaque quizz, on lui associe son handler
  quizzes.forEach((q) => {
    q.onclick = clickQuiz;
  });
}

// function createMyQuiz() {
//   let body = document.getElementById('id-my-current-quiz');

//   let html;

//   html = `<div class="card-panel cyan lighten-5">
//     <div class="input-field">
//       <i class="material-icons prefix">mode_edit</i>
//       <input id="quiz-title" type="text" class="validate">
//       <label for="quiz-title">Title</label>
//     </div>
//     <div class="input-field">
//       <i class="material-icons prefix">mode_edit</i>
//       <textarea id="quiz-descr" class="materialize-textarea" data-length="120"></textarea>
//       <label for="quiz-descr">Description</label>
//     </div>
//   </div>`;

//   body.innerHTML = html;
// }

function renderMyQuizzes() {
  const listHtml = document.getElementById('id-my-quizzes-list');

  let html = '';
  if (state.myQuizzes.length === 0) {
    html = `<h4>You don't have any quizzes</h4>`;
  }
  else {
    html = `<nav class="myQuizzes-tool-bar">
      <div class="nav-wrapper">
        <ul class="left hide-on-med-and-down">
          <li><a class="modal-trigger" href="#modal-create-quiz"><i class="material-icons left">add</i>Create</a></li>
        </ul>
      </div>
    </nav>
    <ul class="collection">`;
    state.myQuizzes.map((q) => {
      let createdDate = q.created_at.split('T')[0];
      html += `<li class="collection-item cyan lighten-5 myquizzes-element" data-quizzid="${q.quiz_id}">
        ${(q.open) ?
          '<span class="new badge blue" data-badge-caption="open"></span>' : 
          '<span class="new badge red" data-badge-caption="closed"></span>'
        }
        <h5>${q.title}</h5>
        <p>${q.description}</p>
        <a class="chip">Post Date : ${createdDate}</a>
        <a class="chip">Quizz ID : ${q.quiz_id}</a>
        <div class="row myquizzes-menu-btns">
          <div class="col s6">
            <a class="waves-effect waves-light btn-small cyan" onclick="deleteQuiz(${q.quiz_id})"><i class="material-icons left">delete</i>Delete</a>
          </div>
          <div class="col s6">
            <a class="waves-effect waves-light btn-small cyan" onclick="getMyQuestions(${q.quiz_id})"><i class="material-icons left">create</i>Edit</a>
          </div>
        </div>
      </li>`;
    });
    html += `</ul>`;
  }

  listHtml.innerHTML = html;

  const myCurrentQuizHtml = document.getElementById('id-my-current-quiz');
  myCurrentQuizHtml.innerHTML = `<nav class="myQuizzes-tool-bar">
    <div class="nav-wrapper">
      <ul class="left hide-on-med-and-down">
        <li class="status-message valign-wrapper">
          <i class="material-icons">chevron_left</i>
          <span>Select a quizz to add, edit or remove questions / propositions</span>
        </li>
      </ul>
    </div>
  </nav>`;
}

function renderMyCurrentQuiz() {
  const main = document.getElementById('id-my-current-quiz');

  let html = '';
  let myQuestionsArr = state.myQuestions;

  console.log("myQuestions: ");
  console.log(state.myQuestions);

  console.log("Quizzes: ");
  console.log(state.quizzes);

  let myQuiz_id = state.myCurrentQuiz;

  if (myQuestionsArr.length === 0) {
    html = `<nav class="myQuizzes-tool-bar">
      <div class="nav-wrapper">
        <ul class="left hide-on-med-and-down">
          <li class="status-message valign-wrapper">
            <i class="material-icons">sentiment_dissatisfied</i>
            <span>This quizz doesn't have any questions !</span>
          </li>
          <li><a onclick="onClickMyQuizBtn(${myQuiz_id},'add-question')"><i class="material-icons left">add</i>Add Question</a></li>
          <li><a onclick="onClickMyQuizBtn(${myQuiz_id},'edit-quiz')"><i class="material-icons left">create</i>Edit Quiz</a></li>
        </ul>
      </div>
    </nav>`;
  }
  else {
    html = `<nav class="myQuizzes-tool-bar">
      <div class="nav-wrapper">
        <ul class="left hide-on-med-and-down">
          <li class="status-message"><span>${myQuestionsArr.length} ${(myQuestionsArr.length === 1) ? "question" : "questions"}</span></li>
          <li><a onclick="onClickMyQuizBtn(${myQuiz_id},'add-question')"><i class="material-icons left">add</i>Add Question</a></li>
          <li><a onclick="onClickMyQuizBtn(${myQuiz_id},'edit-quiz')"><i class="material-icons left">create</i>Edit Quiz</a></li>
        </ul>
      </div>
    </nav>
    <ul class="collection">`;
    myQuestionsArr.map((qstn, index) => {
      html += `<li class="collection-item cyan lighten-4 quiz-question">
        <div class="row valign-wrapper">
          <span class="col quiz-qstn-nb">Question ${index+1} :</span>
          <a class="col myQuiz-edit-prop-btn valign-wrapper" onclick="onClickMyQuizBtn(${myQuiz_id}, 'edit-question', ${qstn.question_id})">
            <i class="material-icons">create</i>
            Edit Question
          </a>
          <a class="col myQuiz-remove-prop-btn valign-wrapper" onclick="deleteQuestion(${myQuiz_id}, ${qstn.question_id})">
            <i class="material-icons">delete</i>
            Remove Question
          </a>
        </div>
        <p class="quiz-qstn-sentence">
          ${qstn.sentence}
          <i id="question-drop-down-btn-${qstn.question_id}" class="material-icons question-drop-down-btn" onclick="showHideProps(${qstn.question_id})">arrow_drop_down</i>
        </p>
        <ul id="qstn-${qstn.question_id}-props" class="collection propositions-block-expanded">`;
      let propositionsArr = qstn.propositions;
      if (propositionsArr.length === 0) {
        html += `<li class="collection-item cyan lighten-4 question-proposition">
          <p>This Question doesn't have any propositions</p>
        </li>`;
      }
      else {
        propositionsArr.map((prop) => {
          html += `<li class="collection-item cyan lighten-4 question-proposition row">
            <p class="col">${prop.proposition_id+1}) ${prop.content}</p>
            <a class="myQuiz-edit-prop-btn valign-wrapper col">
              <i class="material-icons">create</i>
              Edit
            </a>
            <a class="myQuiz-remove-prop-btn valign-wrapper col">
              <i class="material-icons">delete</i>
              Remove
            </a>
          </li>`;
        });
      }
      html += `<li class="collection-item cyan lighten-4">
        <a class="myQuiz-add-prop-btn">
          <i class="material-icons left">add</i>
          Add Proposition
        </a>
      </li>
      </ul>`;
    });
    html += `</ul>`;
  }

  main.innerHTML = html;
}

function renderMyAnswers() {
  const listHtml = document.getElementById('id-my-answers-list');

  let html = '';
  if (state.myAnswers.length === 0) {
    html = `<h4>You don't have answers</h4>`;
  }
  else {
    html = `<nav class="myQuizzes-tool-bar">
      <div class="nav-wrapper">
        <ul class="left hide-on-med-and-down">
          <li><span>${state.myAnswers.length} ${(state.myAnswers.length === 1) ? "answer" : "answers"}</span></li>
        </ul>
      </div>
    </nav>
    <ul class="collection">`;
    state.myAnswers.map((answ) => {
      html += `<li class="collection-item cyan lighten-5 quizz-element">
        <h5>${answ.title}</h5>
        <p>${answ.description}</p><a class="chip">Author : ${answ.owner_id}</a>
        <a class="chip">Quizz ID : ${answ.quiz_id}</a>
      </li>`;
    });
    html += `</ul>`;
  }

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
    html = `<nav class="myQuizzes-tool-bar">
      <div class="nav-wrapper">
        <ul class="left hide-on-med-and-down">
          <li class="status-message valign-wrapper">
            <i class="material-icons">sentiment_dissatisfied</i>
            <span>This quizz doesn't have any questions !</span>
          </li>
        </ul>
      </div>
    </nav>`;
  }
  else {
    html = `<nav class="myQuizzes-tool-bar">
      <div class="nav-wrapper">
        <ul class="left hide-on-med-and-down">
          <li class="status-message"><span>${questionsArr.length} ${(questionsArr.length === 1) ? "question" : "questions"}</span></li>
        </ul>
      </div>
    </nav>
    <ul class="collection">`;
    questionsArr.map((qstn, index) => {
      html += `<li class="collection-item cyan lighten-4 quiz-question">
        <p class="quiz-qstn-nb">Question ${index+1} :</p>
        <p class="quiz-qstn-sentence">
          ${qstn.sentence}
          <i id="question-drop-down-btn-${qstn.question_id}" class="material-icons question-drop-down-btn" onclick="showHideProps(${qstn.question_id})">arrow_drop_down</i>
        </p>
        <ul id="qstn-${qstn.question_id}-props" class="collection propositions-block-expanded">`;
      let propositionsArr = qstn.propositions;
      if (propositionsArr.length === 0) {
        html += `<li class="collection-item cyan lighten-4 question-proposition">
          <p>This Question doesn't have any propositions</p>
        </li>`;
      }
      else {
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
      }
      html += `</ul>`;
    });
    html += `</ul>
    <a id="quiz-done-btn" class="waves-effect waves-light btn disabled cyan" onclick="onClickTerminer()"><i class="material-icons right">done</i>Terminer</a>`;
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

function modifyMyQuizModal (quiz_id, action, qstn_id = 0) {
  // let modal_html = document.getElementById('modal-template');
  let modal_title = document.getElementById('modal-template-title');
  let modal_body = document.getElementById('modal-template-body');
  let modal_footer = document.querySelector('#modal-template .modal-footer');

  switch (action) {
    case 'add-question':

      modal_title.innerHTML = 'Add Question';
      modal_body.innerHTML = `<div class="input-field">
        <input id="input-add-question" type="text" class="validate">
        <label for="input-add-question">Question</label>
      </div>`;
      modal_footer.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat">Cancel</a>
      <a onclick="postQuestion(${quiz_id})" id="modal-template-okBtn" href="#!" class="modal-close waves-effect waves-green btn-flat cyan-text">OK</a>`;

      break;

    case 'edit-quiz':

      modal_title.innerHTML = 'Edit Quiz';
      modal_body.innerHTML = `<div class="input-field">
        <input id="input-change-quiz-title" type="text" class="validate">
        <label for="input-change-quiz-title">Title</label>
      </div>
      <div class="input-field">
        <textarea id="input-change-quiz-description" class="materialize-textarea" data-length="120"></textarea>
        <label for="input-change-quiz-description">Description</label>
      </div>
      <div class="switch">
        <label>
          Closed
          <input id="input-change-quiz-open" type="checkbox" value="open" checked>
          <span class="lever"></span>
          Open
        </label>
      </div>`;
      modal_footer.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat">Cancel</a>
      <a onclick="updateQuiz(${quiz_id})" id="modal-template-okBtn" href="#!" class="modal-close waves-effect waves-green btn-flat cyan-text">OK</a>`;

      break;

    case 'edit-question':

      modal_title.innerHTML = 'Edit Question';
      modal_body.innerHTML = `<div class="input-field">
        <textarea id="input-edit-question" class="materialize-textarea" data-length="120"></textarea>
        <label for="input-edit-question">New Question</label>
      </div>`;
      modal_footer.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat">Cancel</a>
      <a onclick="updateQuestion(${quiz_id},${qstn_id})" id="modal-template-okBtn" href="#!" class="modal-close waves-effect waves-green btn-flat cyan-text">OK</a>`;

      break;
  }
}