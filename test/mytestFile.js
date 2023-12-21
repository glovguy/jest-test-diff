describe('my describe text', () => {

    describe('this is a nested desc block', () => {
        it('does a thing', () => {
            console.log('test here');
        });
    });

    describe('second nested block', () => {
        it('does some other thing', () => {
            console.log('second assertion');
        });
        describe('when another thing', () => {
            it('does some third thing', () => {
                console.log('third assertion');
            });
        });
    });
});