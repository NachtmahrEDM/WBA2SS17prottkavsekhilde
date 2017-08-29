module.exports = (app, jsonparser, client) => {
    //POST COCKTAIL INGREDIENTS
    app.post("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {

        var allname = "cocktails:" + req.params.name + ":ingredients";

        client.lrange(allname, "0", "-1", (error, reply) => {

            if (reply.length == 0) {
                req.body.forEach((element) => {
                    console.log("Element: " + element.ingr + " - " + element.meng);

                    client.hmset("ingredient:" + element.ingr, "name", element.ingr, "desc", element.meng, (error, reply) => {
                        client.rpush(allname, element.ingr, (error, listreply) => {
                            client.hset("inme:" + req.params.name, element.ingr, element.meng, (error2, reply2) => {
                                /*
                                * Writes into an inme:[name] hash
                                */
                            });
                        });
                    });
                });
            } else {
                client.lrange(allname, "0", "-1", (errr, repp) => {
                });
            }
        });
        next();
    });

    //CALLBACK POST COCKTAIL INGREDIENTS
    app.post("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {
        res.set({ 'Content-Type': 'application/json' });
        res.status(201);
        res.write("Oki Doki");
        res.end();
    });


    // GET COCKTAILS INGREDIENTS
    app.get("/cocktails/:name/ingredients", jsonparser, (req, res) => {
        client.hgetall("inme:" + req.params.name, (error, reply) => {

            //console.log("Reply, Cocktails: " + reply);

            var dummy =
                {
                    "Keine": "Da ist irgendwas schief gelaufen"
                };

            res.set({ 'Content-Type': 'application/json' });
            if (!reply) {
                console.log("Dummy wurde eingefügt!");
                res.status(404);
                res.write(JSON.stringify(dummy));
                console.log(dummy);
            } else {
                console.log("Kein Dummy, dummerchen!");
                res.status(200);
                res.write(JSON.stringify(reply));
                console.log(reply);
            }
            res.end();
        });
    });

    //PUT COCKTAILS INGREDIENTS
    app.put("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {
        var canset = true;
        client.lrange("cocktails:" + req.name + ":ingredients", "0", "-1", (error, reply) => {
            if (reply.length) {
                req.body.ingredients.forEach((element) => {
                    reply.forEach((entryInList) => {
                        req.body.forEach((newElement) => {
                            if (entryInList.name == newElement.name) {
                                canset = false;
                            }
                        });
                        if (canset) {
                            client.hmset("ingredient:" + element.name, "name", element.name, "desc", element.desc, (error, reply) => {
                                client.rpush("cocktails:" + element.name + ":ingredients", element.name, (error, listreply) => { });
                            });
                        }
                    });
                });
            }
        });
        next();
    });

    //CALLBACK PUT COCKTAIL INGREDIENTS
    app.put("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {
        res.set({ 'Content-Type': 'application/json' });
        res.status(200);
        res.write(JSON.stringify(reply));
        res.end();
    });

    //DELETE COCKTAIL INGREDIENTS
    app.delete("/cocktails/:cocktail_name/ingredients/:ingredient_name", jsonparser, (req, res, next) => {
        var candelete = false;
        var allname = "cocktails:" + req.params.cocktail_name + ":ingredients";
        client.lrange(allname, "0", "-1", (error, reply) => {
            for (var j = 0; j < reply.length; j++) {
                if (reply[j] == req.params.ingredient_name) {
                    candelete = true;
                    break;
                }
            }
            if (candelete) {
                client.hdel("inme:" + req.params.cocktail_name, req.params.ingredient_name, (error, reply) => {
                    if (!error) {
                        res.set({ 'Content-Type': 'text/plain' });
                        res.status(200);
                        res.end();

                    } else {
                        res.status(500);
                        res.json(error);
                        res.end();
                    }
                });
            } else {
                res.set({ 'Content-Type': 'text/plain' });
                res.status(404);
                res.end();
            }
        });
    });

}