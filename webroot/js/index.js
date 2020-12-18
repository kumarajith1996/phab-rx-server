var STATUS = [
    {id: 0, value: 'Open' , name: 'open'},
    {id: 1, value: 'Assess' , name: 'assess'},
    {id: 2, value: 'In Progress' , name: 'inProgress'},
    {id: 3, value: 'Code Review' , name: 'codeReview'},
    {id: 4, value: 'Unit Testing' , name: 'unitTesting'},
    {id: 5, value: 'Fixed' , name: 'fixed'},
    {id: 6, value: 'Ready For QA Testing' , name: 'readyForQATesting'},
    {id: 7, value: 'Quality Assurance Testing' , name: 'qaTesting'},
    {id: 8, value: 'Quality Assurance Completed' , name: 'qaCompleted'},
    {id: 9, value: 'User Acceptance Testing' , name: 'userAcceptanceTesting'},
    {id: 1, value: 'Ready To Release' , name: 'readyToRelease'},
    {id: 1, value: 'Resolved' , name: 'resolved'},
    {id: 1, value: 'Not reproducible' , name: 'notReproducible'},
    {id: 1, value: 'Will fix later' , name: 'willFixLater'},
    {id: 1, value: 'Will not fix' , name: 'wontfix'},
    {id: 1, value: 'Invalid' , name: 'invalid'}
]
$(function() {
 

    var db = {
        loadData: function(filter) {
            return $.ajax({
                type: "GET",
                url: "tickets.json",
                data: filter
            }).then((data)=> {
                return data.returnData;
            });
        },
        
        insertItem: function(item) {
            return $.ajax({
                type: "POST",
                url: "tickets/add.json",
                data: item
            });
        },
        
        updateItem: function(item) {
            return $.ajax({
                type: "PUT",
                url: "tickets/edit.json",
                data: item
            });
        },
        
        deleteItem: function(item) {
            return $.ajax({
                type: "DELETE",
                url: "tickets/delete.json",
                data: item
            });
        }
    }
    $("#jsGrid").jsGrid({
        height: '100%',
        width: "100%",
 
        filtering: false,
        editing: true,
        sorting: true,
        paging: true,
        autoload: true,
 
        pageSize: 10,
        loadIndication: true,
        pageButtonCount: 5,
        pagePrevText: "<",
        pageNextText: ">",
        pageFirstText: "<<",
        pageLastText: ">>",
 
        controller: db,
 
        fields: [
            { name: 'id', title: "Id", type: "text", width: 150 },
            { name: 'name', title: 'Name', type: "text", width: 150 },
            { name: 'status', title: 'Status', type: "select", 
                    itemTemplate: function(value, item) { 
                        //console.log("asd", value, item); 
                        return value;
                    },
                items: STATUS, valueField: "id", textField: "name" },
            { type: "control" }
        ]
    });
 
});