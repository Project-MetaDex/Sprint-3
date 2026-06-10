function Side(status){

    var menu = document.querySelector('.Side-Container')

    return status == 'Open' ?  menu.style.display = 'block' : menu.style.display = 'none';

}