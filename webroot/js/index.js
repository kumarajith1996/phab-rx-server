var STATUS = [
    {id: 0, value: 0 , name: 'Open'},
    {id: 1, value: 1 , name: 'Assess'},
    {id: 2, value: 2 , name: 'InProgress'},
    {id: 3, value: 3 , name: 'CodeReview'},
    {id: 4, value: 4 , name: 'UnitTesting'},
    {id: 5, value: 5 , name: 'Fixed'},
    {id: 6, value: 6 , name: 'ReadyForQATesting'},
    {id: 7, value: 7 , name: 'QATesting'},
    {id: 8, value: 8 , name: 'QACompleted'},
    {id: 9, value: 9 , name: 'UserAcceptanceTesting'},
    {id: 10, value: 10, name: 'ReadyToRelease'},
    {id: 11, value: 11 , name: 'Resolved'},
    {id: 12, value: 12 , name: 'NotReproducible'},
    {id: 13, value: 13 , name: 'WillFixLater'},
    {id: 14, value: 14 , name: 'Wontfix'},
    {id: 15, value: 15 , name: 'Invalid'}
]

var PRIORITY = [
  {id: 80, value: '80' , name: 'High'},
  {id: 50, value: '50' , name: 'Medium'},
  {id: 25, value: '25' , name: 'Low'},
  {id: 0,  value: '0' ,  name: 'Wishlist'},
  {id: 90, value: '90' , name: 'Needs Triage'}
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
            { name: 'name', title: 'Name', type: "text", width: 150 ,sorting: false},
            {name: 'description', title: 'Ticket Description', type: "text", width: 150, sorting: false},
            { name: 'status', title: 'Status', sorter: "STATUS", type: "select",
                    itemTemplate: function(value, item) {
                        //console.log("asd", value, item);
                        return value;
                    },
                items: STATUS, valueField: "id", textField: "name" },

            { name: 'priority', title: 'Priority', type: "select",
                    itemTemplate: function(value, item) {
                        //console.log("asd", value, item);
                        return value;
                    },
                items: PRIORITY, valueField: "id", textField: "name" },

            { type: "control" }
        ]

    });
});

jsGrid.sortStrategies.STATUS = function(index1, index2) {
    var status1 = STATUS[index1];
    var status2 = STATUS[index2];
    return status1.id.localeCompare(status2.id);
};
