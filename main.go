package main

import(
	"log"
	"net/http"
	"Go_ChatApp_with_React/handlers"
	"fmt"
)

func main() {

	fs := http.FileServer(http.Dir("./public")) //getting the index file 

    http.Handle("/", fs) //root folder 
    
    http.HandleFunc("/ws", handlers.HandleConnections)
    
    log.Println("Server started on :4040")
    err := http.ListenAndServe(":4040", nil)
    if err != nil {
        log.Fatal("ListenAndServe: ", err)
		fmt.Println("server not initiated")
    }

}
