const deleteform = document.querySelectorAll(".delete");

deleteform.forEach((form)=>{
    form.addEventListener("submit",function(e){
        let ans=confirm("Are you sure! you want to delete this content?");
        if(!ans){
            e.preventDefault();
        }
    });
});