const app = () => {
  const ENTER = 'Enter';
  const ESCAPE = 'Escape';
  const ELEMENTS_COUNT = 5;

  const addButton = document.querySelector('#button-add');
  const addInput = document.querySelector('.input-todo');
  const elementList = document.querySelector('.elem-list');
  const filterButtons = document.querySelector('.buttons-container');
  const pagesList = document.querySelector('.pages-list');
  const checkAllAndDelete = document.querySelector('.first-li');

  let todos = [];
  let filterType = 'all';
  let currentPage = 1;
  let checkedAll = false;

  const pagination = (calculatePage) => {
    let pageNumber = '';

    for (let i = 1; i <= calculatePage; i += 1) {
      const activeClass = (i === currentPage) ? 'active-page' : '';
      pageNumber
        += `<button class="pagination-button ${activeClass}">${i}</button>`;
    }
    pagesList.innerHTML = pageNumber;
  };

  const createListItem = (id, status, text) => {
    const checked = status ? 'checked' : '';
    const listItem = `<li data-id="${id}">
    <input type="checkbox" class="completed" ${checked} />
    <span class="text">${text}</span>
    <input class="edit" type="text" hidden />
    <button class="delete-button">X</button>
    </li>`;
    return listItem;
  };

  const filtration = () => {
    let array = [];

    switch (filterType) {
      case 'active':
        array = todos.filter((element) => !element.status);
        return array;
      case 'completed':
        array = todos.filter((element) => element.status);
        return array;
      default:
        return [...todos];
    }
  };

  const setCount = () => {
    const buttons = filterButtons.children;
    const countForActive = todos.filter((element) => !element.status).length;
    const countForCompleted = todos.filter((element) => element.status).length;

    buttons[0].textContent = `All(${todos.length})`;
    buttons[1].textContent = `Active(${countForActive})`;
    buttons[2].textContent = `Completed(${countForCompleted})`;
  };

  const render = () => {
    setCount();
    const arrayOfItems = filtration();
    let todoList = '';
    const calculatePage = Math.ceil(arrayOfItems.length / ELEMENTS_COUNT);

    arrayOfItems
      .slice((currentPage * ELEMENTS_COUNT - ELEMENTS_COUNT), currentPage * ELEMENTS_COUNT)
      .forEach((element) => {
        todoList += createListItem(element.id, element.status, element.text);
      });

    pagination(calculatePage);

    elementList.setAttribute('todo-list', todoList);
    elementList.innerHTML = todoList;
    checkAllAndDelete.children[0].checked = arrayOfItems.length
      ? arrayOfItems.every((item) => item.status === true) : false;
  };

  const setCurrentPage = (event) => {
    if (event.target.className !== 'pages-list') {
      currentPage = Number(event.target.innerHTML);
      render();
    }
  };

  const textAssignment = (id, input) => {
    todos.forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      if (element.id === Number(id)) element.text = input.value;
    });
  };

  const saveOrCancelValue = (event) => {
    const currentSpan = event.target.parentNode.children[1];
    const editInput = event.target;
    const listItemId = event.target.parentNode.dataset.id;

    if (event.key === ENTER) {
      currentSpan.hidden = false;
      textAssignment(listItemId, editInput);
      render();
      editInput.hidden = true;
    }
    if (event.key === ESCAPE) {
      render();
    }
  };

  const saveOnBlur = (event) => {
    if (event.sourceCapabilities !== null) {
      const currentSpan = event.target.parentNode.children[1];
      const editInput = event.target;
      const listItemId = event.target.parentNode.dataset.id;

      currentSpan.hidden = false;
      textAssignment(listItemId, editInput);
      editInput.hidden = true;
      render();
    }
  };

  const editTodo = (event, parent) => {
    const currentSpan = event.target;
    const editInput = parent.children[2];

    currentSpan.hidden = true;
    editInput.hidden = false;
    editInput.value = currentSpan.innerHTML;
    editInput.focus();
  };

  const pageNext = () => {
    const lastPage = Math.ceil(todos.length / ELEMENTS_COUNT);
    currentPage = currentPage < lastPage ? lastPage : currentPage;
  };

  const pageBack = () => {
    const lastPage = Math.ceil(todos.length / ELEMENTS_COUNT);
    currentPage = currentPage > lastPage ? lastPage : currentPage;
  };

  const createTodo = () => {
    const inputText = _.escape(addInput.value.replace(/\s+/g, ' ').trim());

    if (inputText !== '' && inputText.length < 255) {
      const obj = {
        text: inputText,
        status: false,
        id: Date.now(),
      };
      todos.push(obj);
      addInput.value = '';

      pageNext();
      render();
    }
  };

  const handleClick = (event) => {
    if (event.key === ENTER) {
      createTodo();
    }
  };

  const choiceFunction = (event) => {
    const { className, parentNode } = event.target;
    const { id } = parentNode.dataset;

    if (className === 'completed') {
      todos.forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        if (element.id === Number(id)) element.status = !element.status;
      });

      render();
    }
    if (className === 'text' && event.detail === 2) {
      editTodo(event, parentNode);
    }
    if (className === 'delete-button') {
      todos = todos.filter((element) => element.id !== Number(id));
      pageBack();
      render();
    }
  };

  const setActiveClassForButton = (activeElement, children) => {
    const filterElements = [...children];
    filterElements.forEach((element) => {
      if (element === activeElement) {
        activeElement.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    });
  };

  const setFilterType = (event) => {
    const buttonClass = event.target.className;
    const selectedButton = event.target;

    filterType = buttonClass;
    setActiveClassForButton(selectedButton, event.target.parentNode.children);

    currentPage = 1;
    render();
  };

  const transactionsWithAll = (event) => {
    const classOfElement = event.target.className;

    if (classOfElement === 'first-checkbox') {
      todos.forEach((element) => {
        const status = element;
        status.status = !checkedAll;
      });
      checkedAll = !checkedAll;
      render();
    }
    if (classOfElement === 'delete-select-button') {
      todos = todos.filter((element) => element.status === false);
      render();
    }
  };

  addButton.addEventListener('click', createTodo);
  addInput.addEventListener('keydown', handleClick);
  elementList.addEventListener('click', choiceFunction);
  elementList.addEventListener('keydown', saveOrCancelValue);
  elementList.addEventListener('blur', saveOnBlur, true);
  filterButtons.addEventListener('click', setFilterType);
  pagesList.addEventListener('click', setCurrentPage);
  checkAllAndDelete.addEventListener('click', transactionsWithAll);
};

app();