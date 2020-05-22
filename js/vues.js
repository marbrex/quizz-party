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
  document.getElementById('id-my-answers-main').innerHTML = '';
};

// génération d'une liste de quizzes avec deux boutons en bas
const htmlQuizzesList = (quizzes, curr, total) => {
  console.debug(`@htmlQuizzesList(.., ${curr}, ${total})`);

  // un élement <li></li> pour chaque quizz. Noter qu'on fixe une donnée
  // data-quizzid qui sera accessible en JS via element.dataset.quizzid.
  // On définit aussi .modal-trigger et data-target="id-modal-quizz-menu"
  // pour qu'une fenêtre modale soit affichée quand on clique dessus
  // VOIR https://materializecss.com/modals.html
  const quizzesLIst = quizzes.results.map(
    (q) =>
      `<li class="collection-item cyan lighten-5 quizz-element" data-quizzid="${q.quiz_id}">
        <h5>${q.title}</h5>
        <p>${q.description}</p><a class="chip">Author : ${q.owner_id}</a>
      </li>`
  );

  // le bouton "<" pour revenir à la page précédente, ou rien si c'est la première page
  // on fixe une donnée data-page pour savoir où aller via JS via element.dataset.page
  const prevBtn = `<li id="id-prev-quizzes" data-page="${curr-1}" class="${(curr !== 1) ? "waves-effect" : "disabled"}"><a><i class="material-icons">chevron_left</i></a></li>`;

  // le bouton ">" pour aller à la page suivante, ou rien si c'est la première page
  const nextBtn = `<li id="id-next-quizzes" data-page="${curr+1}" class="${(curr !== total) ? "waves-effect" : "disabled"}"><a><i class="material-icons">chevron_right</i></a></li>`;

  const toolBar = `<nav class="myQuizzes-tool-bar">
    <div class="nav-wrapper">
      <ul class="hide-on-med-and-down">
        <li class="status-message"><span>${quizzes.results.length} / ${quizzes.nbResults} ${(quizzes.nbResults == 1) ? "quiz" : "quizes"}</span></li>
        <li class="status-message"><span><input type="text" min="1" max="${quizzes.nbResults}" maxlength="${String(quizzes.nbResults).length}" id="quizes-per-page" class="browser-default" value="${quizzes.pageSize}" /> per page</span></li>
        <li class="right"><a class="modal-trigger" href="#modal-sort-quizes"><i class="material-icons">sort</i></a></li>
      </ul>
    </div>
  </nav>`;

  let pageSelector = `<ul class="pagination">
    ${prevBtn}`;

  if (total < 8) {
    for (let i=1; i <= total; i++) {
      pageSelector += `<li class="${i===curr ? "active" : "waves-effect"}" onclick="getQuizzes(${i},${quizzes.pageSize},'${state.quizzes.sort}','${state.quizzes.order}')"><a>${i}</a></li>`;
    }
  }
  else {
    pageSelector += `<li class="${1===curr ? "active" : "waves-effect"}" onclick="getQuizzes(1,${quizzes.pageSize},'${state.quizzes.sort}','${state.quizzes.order}')"><a>1</a></li>
    <li class="${2===curr ? "active" : "waves-effect"}" onclick="getQuizzes(2,${quizzes.pageSize},'${state.quizzes.sort}','${state.quizzes.order}')"><a>2</a></li>
    <li class="${3===curr ? "active" : "waves-effect"}" onclick="getQuizzes(3,${quizzes.pageSize},'${state.quizzes.sort}','${state.quizzes.order}')"><a>3</a></li>
    <li><a>...</a></li>
    <li class="${total-2===curr ? "active" : "waves-effect"}" onclick="getQuizzes(${total-2},${quizzes.pageSize},'${state.quizzes.sort}','${state.quizzes.order}')"><a>${total-2}</a></li>
    <li class="${total-1===curr ? "active" : "waves-effect"}" onclick="getQuizzes(${total-1},${quizzes.pageSize},'${state.quizzes.sort}','${state.quizzes.order}')"><a>${total-1}</a></li>
    <li class="${total===curr ? "active" : "waves-effect"}" onclick="getQuizzes(${total},${quizzes.pageSize},'${state.quizzes.sort}','${state.quizzes.order}')"><a>${total}</a></li>
    `;
  }

  pageSelector += `${nextBtn}
  </ul>`;

  // La liste complète et les deux boutons en bas
  const html = `
  ${toolBar}
  <div id="all-quizzes-list-block">
    <ul id="all-quizzes-list" class="collection">
      ${quizzesLIst.join('')}
    </ul>
    <div class="row center">      
      ${pageSelector}
    </div>
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
  const usersElt = document.getElementById('all-quizzes-side-panel');
  // une fenêtre modale définie dans le HTML
  const modal = document.getElementById('id-modal-quizz-menu');

  state.quizzes.sort = document.getElementById("sort-modal").value;
  state.quizzes.order = document.getElementById("order-modal").value;

  console.log(state.quizzes.sort);
  console.log(state.quizzes.order);

  console.log(`Before getting html : ${state.quizzes.pageSize}`);

  // on appelle la fonction de généraion et on met le HTML produit dans le DOM
  usersElt.innerHTML = htmlQuizzesList(
    state.quizzes,
    state.quizzes.currentPage,
    state.quizzes.nbPages
  );

  // /!\ il faut que l'affectation usersElt.innerHTML = ... ait eu lieu pour
  // /!\ que prevBtn, nextBtn et quizzes en soient pas null
  // les éléments à mettre à jour : les boutons
  const prevBtn = document.getElementById('id-prev-quizzes');
  const nextBtn = document.getElementById('id-next-quizzes');
  // la liste de tous les quizzes individuels
  const quizzes = document.querySelectorAll('#all-quizzes-side-panel #all-quizzes-list li');

  document.getElementById("confirm-sort-order-modal").onclick = () => {
    state.quizzes.sort = document.getElementById("sort-modal").value;
    state.quizzes.order = document.getElementById("order-modal").value;

    getQuizzes(state.quizzes.currentPage, state.quizzes.pageSize, state.quizzes.sort, state.quizzes.order);
  };

  // on recupere l'element input
  const quizzesPerPage = document.getElementById("quizes-per-page");
  // on conserve le nombre des quizzes par page juste avant la modification
  let prevPerPage = state.quizzes.pageSize;

  // on ajoute un evenement, quand l'utilisateur saisie le nombre
  // des quizzes par page, on met a jour la valeur dans state
  quizzesPerPage.addEventListener("input", (e) => {
    let nb = e.target.value;
    if (!isNaN(nb)) {
      // entre 1 et 200 car c'est impose par le serveur
      if (nb >= 1 && nb < 200)
        state.quizzes.pageSize = nb;
      else
        state.quizzes.pageSize = prevPerPage;
      console.log(`On Input : ${state.quizzes.pageSize}`);
    }
  });

  // on ajoute un evenement, quand l'utilisateur a fini d'entrer
  // le nombre et 'focusout' du champs de saisi, on update
  // la page actuelle
  quizzesPerPage.addEventListener("focusout", () => {
    if (prevPerPage < 1 || prevPerPage >= 200) {
      M.toast({
        html: "Number must be between 1 and 199 !",
        displayLength: 3000,
        classes: 'error'
      });
    }
    else getQuizzes(state.quizzes.currentPage, state.quizzes.pageSize, state.quizzes.sort, state.quizzes.order);
    console.log(`On Focus Out : ${state.quizzes.pageSize}`);
  });

  // les handlers quand on clique sur "<" ou ">"
  function clickBtnPager() {
    // remet à jour les données de state en demandant la page
    // identifiée dans l'attribut data-page
    // noter ici le 'this' QUI FAIT AUTOMATIQUEMENT REFERENCE
    // A L'ELEMENT AUQUEL ON ATTACHE CE HANDLER
    getQuizzes(this.dataset.page, state.quizzes.pageSize, state.quizzes.sort, state.quizzes.order);
  }
  if (!prevBtn.classList.contains('disabled')) prevBtn.onclick = clickBtnPager;
  if (!nextBtn.classList.contains('disabled')) nextBtn.onclick = clickBtnPager;

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

  // on met la hauteur de la liste des quizzes
  let block = document.getElementById("all-quizzes-list");
  block.style.maxHeight = `${window.innerHeight - block.offsetTop - 80}px`;
}

function renderMyQuizzes() {
  const listHtml = document.getElementById('id-my-quizzes-list');

  let html = '';
  if (state.myQuizzes.length === 0) {
    html = `<nav class="myQuizzes-tool-bar">
      <div class="nav-wrapper">
        <ul class="left hide-on-med-and-down">
          <li><a class="modal-trigger" href="#modal-create-quiz"><i class="material-icons left">add</i>Create</a></li>
        </ul>
      </div>
    </nav>
    <h4>You don't have any quizzes</h4>`;
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

  console.log("@renderMyCurrentQuiz() => My Questions : ");
  console.log(state.myQuestions);

  console.log("@renderMyCurrentQuiz() => Quizzes : ");
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
          <li><a onclick="onClickMyQuizBtn('add-question', ${myQuiz_id})"><i class="material-icons left">add</i>Add Question</a></li>
          <li><a onclick="onClickMyQuizBtn('edit-quiz', ${myQuiz_id})"><i class="material-icons left">create</i>Edit Quiz</a></li>
        </ul>
      </div>
    </nav>`;
  }
  else {
    html = `<nav class="myQuizzes-tool-bar">
      <div class="nav-wrapper">
        <ul class="left hide-on-med-and-down">
          <li class="status-message"><span>${myQuestionsArr.length} ${(myQuestionsArr.length === 1) ? "question" : "questions"}</span></li>
          <li><a onclick="onClickMyQuizBtn('add-question', ${myQuiz_id})"><i class="material-icons left">add</i>Add Question</a></li>
          <li><a onclick="onClickMyQuizBtn('edit-quiz', ${myQuiz_id})"><i class="material-icons left">create</i>Edit Quiz</a></li>
        </ul>
      </div>
    </nav>
    <ul class="collection">`;
    myQuestionsArr.map((qstn, index) => {
      html += `<li class="collection-item cyan lighten-4 quiz-question">
        <div class="row valign-wrapper">
          <span class="col quiz-qstn-nb">Question ${index+1} :</span>
          <a class="col myQuiz-edit-prop-btn valign-wrapper" onclick="onClickMyQuizBtn('edit-question', ${myQuiz_id}, ${qstn.question_id})">
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
            <p class="col">${prop.proposition_id+1}) ${prop.content}</p>`;
          // html += `<a class="myQuiz-edit-prop-btn valign-wrapper col">
          //     <i class="material-icons">create</i>
          //     Edit
          //   </a>
          //   <a class="myQuiz-remove-prop-btn valign-wrapper col">
          //     <i class="material-icons">delete</i>
          //     Remove
          //   </a>`;
          html += `</li>`;
        });
      }
      // html += `<li class="collection-item cyan lighten-4">
      //   <a class="myQuiz-add-prop-btn">
      //     <i class="material-icons left">add</i>
      //     Add Proposition
      //   </a>
      // </li>`;
      html += `</ul>`;
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
      html += `<li class="collection-item cyan lighten-5 quizz-element" onclick="renderMyCurrentAnswers(${answ.quiz_id})">
        <h5>${answ.title}</h5>
        <p>${answ.description}</p><a class="chip">Author : ${answ.owner_id}</a>
        <a class="chip">Quizz ID : ${answ.quiz_id}</a>
      </li>`;
    });
    html += `</ul>`;
  }

  listHtml.innerHTML = html;
}

function renderMyCurrentAnswers(quiz_id) {
  const myAnswers = document.getElementById('id-my-answers-main');

  // let quizPromise = getOneQuiz(quiz_id);
  // quizPromise.then((quiz) => {

  //   console.log(`@renderMyCurrentAnswers(${quiz_id}) => Quiz :`);
  //   console.log(quiz);

    let html = `<ul class="collection">`;
    state.myAnswers.map((answ) => {
      if (answ.quiz_id === quiz_id) {
        answ.answers.map((a) => {
          html += `<li class="collection-item cyan lighten-4 quiz-question">
            <p>Question ID : ${a.question_id}</p>
            <p>Proposition ID : ${a.proposition_id}</p>
          </li>`;
        });
      }
    });
    html += `</ul>`;

    myAnswers.innerHTML = html;

  // });
}

function renderCurrentQuizz() {
  const main = document.getElementById('id-all-quizzes-main');

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

function modifyMyQuizModal (action, quiz_id = 0, qstn_id = 0) {
  console.debug(`@modifyMyQuizModal('${action}', ${quiz_id}, ${qstn_id})`);

  // let modal_html = document.getElementById('modal-template');
  let modal_title = document.getElementById('modal-template-title');
  let modal_body = document.getElementById('modal-template-body');
  let modal_footer = document.querySelector('#modal-template .modal-footer');

  state.modalAction = action;
  state.modal_qstn_id = qstn_id;

  switch (action) {
    case 'add-question':

      modal_title.innerHTML = 'Add Question';

      if (state.qstnContentTemp === undefined) {
        state.qstnContentTemp = '';
      }
      if (state.propObjArr === undefined) {
        state.propObjArr = [];
      }
      if (state.props_ids === undefined) {
        state.props_ids = [];
      }

      let html = `<div class="input-field">
        <input id="input-question" type="text" class="validate" value="${state.qstnContentTemp}">
        <label ${(state.propObjArr) ? 'class="active"' : ''} for="input-question">Question *</label>
      </div>
      <ul class="collection">`;
      state.propObjArr.map((prop, index) => {
        html += `<li class="collection-item question-proposition row add-qstn-modal-prop-block">
          <p class="col">${index+1}) ${prop.content}</p>
          <a class="myQuiz-remove-prop-btn valign-wrapper col right" onclick="removePropQstnModal(${prop.proposition_id})">
            <i class="material-icons">delete</i>
            Remove
          </a>
          <label class="col right">
            <input id="prop-id-${prop.proposition_id}" name="add-qstn-modal-prop-correct" type="radio" />
            <span>Correct</span>
          </label>
        </li>`;
      });
      html += `<li class="collection-item">
        <div class="row valign-wrapper add-qstn-modal-input-prop-block">
          <div class="input-field col">
            <input id="add-qstn-modal-input-prop" type="text" class="validate">
            <label for="add-qstn-modal-input-prop">Proposition</label>
          </div>
          <a class="add-qstn-modal-add-prop-btn valign-wrapper col right" onclick="addPropQstnModal()">
            <i class="material-icons">add</i>
            Add
          </a>
        </div>
      </li>`;
      html += `</ul>`;
      modal_body.innerHTML = html;

      modal_footer.innerHTML = `
      <a class="modal-close waves-effect waves-green btn-flat">Cancel</a>
      <a onclick="postQuestion(${quiz_id})" id="modal-template-okBtn" class="waves-effect waves-green btn-flat cyan-text">OK</a>`;

      break;

    case 'edit-quiz':

      let quizToEditPromise = getOneQuiz(quiz_id);
      quizToEditPromise.then((quizToEdit) => {

        console.log(`quizToEdit :`);
        console.log(quizToEdit);

        modal_title.innerHTML = 'Edit Quiz';
        modal_body.innerHTML = `<div class="input-field">
          <input id="input-change-quiz-title" type="text" class="validate" value="${quizToEdit.title}">
          <label class="active" for="input-change-quiz-title">Title *</label>
        </div>
        <div class="input-field">
          <textarea id="input-change-quiz-description" class="materialize-textarea" data-length="120">${quizToEdit.description}</textarea>
          <label class="active" for="input-change-quiz-description">Description *</label>
        </div>
        <div class="switch">
          <label>
            Closed
            <input id="input-change-quiz-open" type="checkbox" value="open" ${(quizToEdit.open) ? 'checked' : ''}>
            <span class="lever"></span>
            Open
          </label>
        </div>`;
        modal_footer.innerHTML = `
        <a class="modal-close waves-effect waves-green btn-flat">Cancel</a>
        <a onclick="updateQuiz(${quiz_id})" id="modal-template-okBtn" class="waves-effect waves-green btn-flat cyan-text">OK</a>`;
      });

      break;

    case 'edit-question':

      modal_title.innerHTML = 'Edit Question';

      // console.log(`@modifyMyQuizModal('${action}', ${quiz_id}, ${qstn_id}) => state.propObjArr BEFORE`);
      // console.log(state.propObjArr);

      // Pour pre-remplir les champs du formulaire
      // (execute qu'une seule fois)
      if (state.qstnContentTemp === undefined &&
          state.propObjArr === undefined &&
          state.props_ids === undefined) {

        state.myQuestions.map((qstn) => {
          if(qstn.question_id === qstn_id) {

            state.qstnContentTemp = qstn.sentence;
            state.propObjArr = [];
            state.props_ids = [];

            // On copie toutes les propositions dans state.propObjArr
            // (on est oblige de faire comme ca, car si on fait
            // state.propObjArr = qstn.propositions
            // JS va faire une reference et c'est pas ce qu'on veut)
            qstn.propositions.map((prop, index) => {
              state.propObjArr[index] = {
                content: prop.content,
                proposition_id: prop.proposition_id,
                correct: false
              };
              // On copie les IDs
              state.props_ids.push(prop.proposition_id);
            });
          }
        });
      }

      // console.log(`@modifyMyQuizModal('${action}', ${quiz_id}, ${qstn_id}) => state.propObjArr AFTER`);
      // console.log(state.propObjArr);

      let htmlEditQstn = `<div class="input-field">
        <input id="input-question" type="text" class="validate" value="${state.qstnContentTemp}">
        <label ${(state.propObjArr) ? 'class="active"' : ''} for="input-question">Question *</label>
      </div>
      <ul class="collection">`;
      state.propObjArr.map((prop, index) => {
        htmlEditQstn += `<li class="collection-item question-proposition row add-qstn-modal-prop-block valign-wrapper">
          <div class="input-field col">
            <input id="prop-content-id-${prop.proposition_id}" type="text" class="validate" value="${prop.content}">
            <label class="active" for="prop-content-id-${prop.proposition_id}">${index+1} Proposition</label>
          </div>`;
        // htmlEditQstn += `<a class="myQuiz-remove-prop-btn valign-wrapper col right" onclick="removePropQstnModal(${prop.proposition_id})">
        //   <i class="material-icons">delete</i>
        //   Remove
        // </a>`;
        htmlEditQstn += `<label class="col right">
          <input id="prop-id-${prop.proposition_id}" name="add-qstn-modal-prop-correct" type="radio" />
          <span>Correct</span>
        </label>`;
        htmlEditQstn += `</li>`;
      });
      // htmlEditQstn += `<li class="collection-item">
      //   <div class="row valign-wrapper add-qstn-modal-input-prop-block">
      //     <div class="input-field col">
      //       <input id="add-qstn-modal-input-prop" type="text" class="validate">
      //       <label for="add-qstn-modal-input-prop">Proposition</label>
      //     </div>
      //     <a class="add-qstn-modal-add-prop-btn valign-wrapper col right" onclick="addPropQstnModal()">
      //       <i class="material-icons">add</i>
      //       Add
      //     </a>
      //   </div>
      // </li>`;
      htmlEditQstn += `</ul>`;
      modal_body.innerHTML = htmlEditQstn;

      modal_footer.innerHTML = `
      <a class="modal-close waves-effect waves-green btn-flat">Cancel</a>
      <a onclick="updateQuestion(${quiz_id},${qstn_id})" id="modal-template-okBtn" class="waves-effect waves-green btn-flat cyan-text">OK</a>`;

      break;
  }
}